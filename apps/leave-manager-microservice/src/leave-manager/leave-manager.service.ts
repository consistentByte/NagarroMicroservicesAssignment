import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NOTIFICATION_CLIENT } from '../shared/constants';
import { ClientProxy } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { AppService } from '../app/app.service';
import { LeaveFilterDto } from './dtos/leave-filter.dto';
import { LeaveFilterEmpDto } from './dtos/leave-filter-emp.dto';
import { ApproveRejectLeaveDto } from './dtos/approve-reject-leave.dto';

@Injectable()
export class LeaveManagerService {
  constructor(
    private prisma: PrismaService,
    @Inject(NOTIFICATION_CLIENT)
    private readonly notificationRMQClient: ClientProxy,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppService.name);
  }

  async getLeaveRequests(employeeId: string, leaveFilter: LeaveFilterDto) {
    try {
      const { limit, page, type, status } = leaveFilter;
      const safeLimit = Math.min(limit, 100);
      const safePage = Math.max(page, 1);
      const skip = (safePage - 1) * safeLimit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.leaveRequest.findMany({
          where: {
            employeeId,
            ...(type && { type }),
            ...(status && { status }),
          },
          orderBy: { startDate: 'desc' },
          skip,
          take: safeLimit,
        }),
        this.prisma.leaveRequest.count({
          where: {
            employeeId,
            ...(type && { type }),
            ...(status && { status }),
          },
        }),
      ]);

      return {
        data,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async getLeaveRequestsOfOtherEmpAsManager(
    reportingManagerId: string,
    { empId, type, status, page, limit }: LeaveFilterEmpDto,
  ) {
    const safeLimit = Math.min(limit, 100);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      reportingManagerId,
      ...(empId && { employeeId: empId }),
      ...(type && { type }),
      ...(status && { status }),
    };

    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.leaveRequest.findMany({
          where,
          orderBy: { startDate: 'desc' },
          skip,
          take: safeLimit,
        }),
        this.prisma.leaveRequest.count({ where }),
      ]);

      return {
        data,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async approveLeaveRequest(
    reportingManagerId: string,
    { leaveId }: ApproveRejectLeaveDto,
  ) {
    try {
      let request = null;

      const response = await this.prisma.$transaction(async (tx) => {
        // 1. Fetch request and verify ownership/status
        request = await tx.leaveRequest.findUnique({
          where: { id: leaveId },
          include: { employee: true },
        });

        if (!request) throw new NotFoundException('Leave request not found');
        if (request.status !== 'PENDING')
          throw new BadRequestException('Request is not pending');
        if (request.reportingManagerId !== reportingManagerId)
          throw new ForbiddenException('Unauthorized');

        // 2. Check for date clashes with existing approved leaves
        const clash = await tx.leaveRequest.findFirst({
          where: {
            employeeId: request.employeeId,
            status: 'APPROVED',
            NOT: { id: leaveId },
            OR: [
              {
                startDate: { lte: request.endDate },
                endDate: { gte: request.startDate },
              },
            ],
          },
        });

        if (clash)
          throw new ConflictException(
            'Date range clashes with an existing approved leave',
          );

        // 3. Calculate business days for decrement
        const daysToDecrement = this.calculateBusinessDays(
          request.startDate,
          request.endDate,
        );

        // 4. Perform Updates
        const res = await tx.leaveRequest.update({
          where: { id: leaveId },
          data: { status: 'APPROVED' },
        });

        console.log('Duration', daysToDecrement);

        const balanceUpdate = await tx.leaveBalance.update({
          where: {
            employeeId_type: {
              employeeId: request.employeeId,
              type: request.type,
            },
          },
          data: { balance: { decrement: daysToDecrement } },
        });

        if (balanceUpdate.balance < 0) {
          throw new BadRequestException(
            'Insufficient balance to approve this request',
          );
        }

        return res;
      });

      try {
        if (request) {
          const employee = await this.prisma.employee.findUnique({
            where: { employeeId: request['employeeId'] },
            include: {
              reportingManager: {
                select: {
                  employeeId: true,
                  name: true,
                },
              },
            },
          });
          if (employee) {
            const msg = {
              leaveId: leaveId,
              employeeId: request['employeeId'],
              employeeName: employee['name'],
              reportingManagerId: employee['reportingManagerId'],
              reportingManagerName: employee['reportingManager']
                ? employee['reportingManager']['name']
                : '',
              type: request['type'],
              status: request['status'],
            };

            this.notificationRMQClient.emit('leave-approved', msg);
            this.logger.info('Leave Approved, Notification sent to RMQ.', msg);
          }
        }
        return response;
      } catch (err) {
        this.logger.warn(err, 'Leave Approved, Notification failed.');
        return response;
      }
    } catch (err) {
      this.logger.error(err, 'Leave Not Approved, Failed');
      throw err;
    }
  }

  async applyForLeave(
    employeeId: string,
    leaveDetails: { type: LeaveType; startDate: Date; endDate: Date },
    reason: string
  ) {
    // Fetch Employee and Reporting Manager details
    const employee = await this.prisma.employee.findUnique({
      where: { employeeId },
      include: {
        leaves: true,
        reportingManager: {
          select: {
            name: true, // Only fetch the manager's name
          },
        },
      },
    });

    console.log(employee?.name, employee?.reportingManager?.name);

    if (!employee || !employee.reportingManagerId) {
      throw new BadRequestException(
        'Employee not found or has no reporting manager',
      );
    }

    // Validate: End Date < Start Date
    if (new Date(leaveDetails.endDate) < new Date(leaveDetails.startDate)) {
      throw new BadRequestException('End Date is before start date');
    }

    // Validate: Start Date >= Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(leaveDetails.startDate) < today) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Calculate Duration (excluding Saturday/Sunday)
    const duration = this.calculateBusinessDays(
      leaveDetails.startDate,
      leaveDetails.endDate,
    );

    // Validate Balance
    const balanceRecord = employee.leaves.find(
      (l) => l.type === leaveDetails.type,
    );
    if (!balanceRecord || balanceRecord.balance < duration) {
      throw new BadRequestException(
        `Insufficient ${leaveDetails.type} balance. Need ${duration} days.`,
      );
    }

    console.log('PASSED', duration);
    try {
      // Perform Transactional Creation
      const response = await this.prisma.$transaction(async (tx) => {
        // Check for clashes within the same transaction
        const clash = await tx.leaveRequest.findFirst({
          where: {
            employeeId,
            status: 'APPROVED',
            OR: [
              {
                startDate: { lte: leaveDetails.endDate },
                endDate: { gte: leaveDetails.startDate },
              },
            ],
          },
        });

        if (clash) {
          throw new ConflictException(
            'Date range clashes with an existing approved leave',
          );
        }

        // Create the Request
        return await tx.leaveRequest.create({
          data: {
            employeeId,
            reportingManagerId: employee.reportingManagerId as string,
            type: leaveDetails.type,
            startDate: leaveDetails.startDate,
            endDate: leaveDetails.endDate,
            status: 'PENDING',
            applyreason: reason
          },
        });
      });

      try {
        const msg = {
          leaveId: response.id,
          employeeId,
          employeeName: employee.name,
          reportingManagerId: employee.reportingManagerId,
          reportingManagerName: employee.reportingManager?.name,
          type: leaveDetails.type,
          startDate: leaveDetails.startDate,
          endDate: leaveDetails.endDate,
          status: response.status,
          duration: duration.toString(),
          reason: reason
        };

        this.notificationRMQClient.emit('leave-apply', msg);
        this.logger.info('Leave Applied, Notification sent to RMQ.', msg);
        return response;
      } catch (err) {
        this.logger.warn(err, 'Leave Applied, Notification failed.');
        return response;
      }
    } catch (err) {
      this.logger.error(err, 'Leave Not Applied');
      throw err;
    }
  }

  async rejectLeaveRequest(
    reportingManagerId: string,
    { leaveId }: ApproveRejectLeaveDto,
    reason: string
  ) {
    try {
      const response = await this.prisma.leaveRequest.update({
        where: {
          id: leaveId,
          status: 'PENDING',
          //Only allow rejection if the reportingManagerId matches
          reportingManagerId: reportingManagerId,
        },
        data: {
          status: 'REJECTED',
          rejectreason: reason
        },
      });

      try {
        const employee = await this.prisma.employee.findUnique({
          where: { employeeId: response.employeeId },
          include: {
            reportingManager: {
              select: {
                employeeId: true,
                name: true,
              },
            },
          },
        });
        if (employee) {
          const msg = {
            leaveId: leaveId,
            employeeId: response.employeeId,
            employeeName: employee.name,
            reportingManagerId: employee.reportingManagerId,
            reportingManagerName: employee['reportingManager']
              ? employee['reportingManager']['name']
              : '',
            type: response.type,
            status: response.status,
            reason: reason
          };

          this.notificationRMQClient.emit('leave-rejected', msg);
          this.logger.info('Leave Rejected, Notification sent to RMQ.', msg);
        }

        return response;
      } catch (err) {
        this.logger.warn(err, 'Leave Rejected, Notification failed.');
        return response;
      }
    } catch (error) {
      if (error) {
        this.logger.error(error, 'Leave Not Rejected, Notification failed.');
        throw new BadRequestException(
          'Action forbidden: Request not found, already processed, or unauthorized.',
        );
      }
      throw error;
    }
  }

  async cancelLeaveRequest(
    employeeId: string,
    { leaveId }: ApproveRejectLeaveDto,
  ) {
    try {
      const response = await this.prisma.leaveRequest.update({
        where: {
          id: leaveId,
          status: 'PENDING',
          //Only allow cancellation if the employeeId matches, can only cancel own
          employeeId: employeeId,
        },
        data: {
          status: 'CANCELLED',
        },
      });

      try {
        const employee = await this.prisma.employee.findUnique({
          where: { employeeId: response.employeeId },
          include: {
            reportingManager: {
              select: {
                employeeId: true,
                name: true,
              },
            },
          },
        });
        if (employee) {
          const msg = {
            leaveId: leaveId,
            employeeId: response.employeeId,
            employeeName: employee.name,
            reportingManagerId: employee.reportingManagerId,
            reportingManagerName: employee['reportingManager']
              ? employee['reportingManager']['name']
              : '',
            type: response.type,
            status: response.status,
          };

          this.notificationRMQClient.emit('leave-cancelled', msg);
          this.logger.info('Leave Cancelled, Notification sent to RMQ.', msg);
        }

        return response;
      } catch (err) {
        this.logger.warn(err, 'Leave Cancelled, Notification failed.');
        return response;
      }
    } catch (error) {
      this.logger.error(error, 'Error while cancelling the leave');
      if (error) {
        throw new BadRequestException(
          'Action forbidden: Request not found, already processed, or unauthorized.',
        );
      }
      throw error;
    }
  }

  // Helper to exclude weekends
  private calculateBusinessDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++; // Exclude Sunday (0) and Saturday (6)
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}

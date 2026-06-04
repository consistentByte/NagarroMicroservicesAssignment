import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { LeaveType } from '@prisma/client';
import { LeaveTypes } from '../shared/enums/leave-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import { NOTIFICATION_CLIENT } from '../shared/constants';
import { ClientProxy } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { AppService } from '../app/app.service';
import { ViewOwnBalanceDto } from './dtos/view-balance-own.dto';
import { ViewEmpBalanceDto } from './dtos/view-balance-emp.dto';

@Injectable()
export class ViewBalanceService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppService.name);
  }

  async getLeaveBalance(
    employeeId: string,
    { type }: ViewOwnBalanceDto | ViewEmpBalanceDto,
  ) {
    try {
      const data = await this.prisma.leaveBalance.findMany({
        where: {
          employeeId,
          ...(type && { type }),
        },
        select: {
          type: true,
          balance: true,
        },
      });

      // this.notificationRMQClient.emit('view-bal', data);
      return data;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async getLeaveBalanceOfEmployeeByManager(
    managerId: string,
    { empId, type }: ViewEmpBalanceDto,
  ) {
    // Fetch the employee and verify the reporting manager relationship
    const employee = await this.prisma.employee.findUnique({
      where: {
        employeeId: empId,
        reportingManagerId: managerId, // Only return if requested person is reporting manager of employee
      },
    });

    if (!employee) {
      throw new ForbiddenException(
        "You are not authorized to view this employee's balance.",
      );
    }

    // Fetch the balance
    try {
      return await this.prisma.leaveBalance.findMany({
        where: {
          employeeId: empId,
          ...(type && { type }),
        },
        select: {
          type: true,
          balance: true,
        },
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  getPrismaLeaveTypeFromType(type?: string) {
    if (type === LeaveTypes.CASUAL) {
      return LeaveType.CASUAL;
    }
    if (type === LeaveTypes.SICK) {
      return LeaveType.SICK;
    }
    if (type === LeaveTypes.PRIVILEGE) {
      return LeaveType.PRIVILEGE;
    }

    return null;
  }
}

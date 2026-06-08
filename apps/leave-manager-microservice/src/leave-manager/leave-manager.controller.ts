import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '../../../../shared/src/index';
import { LeaveManagerService } from './leave-manager.service';
import { ApplyLeaveDto } from './dtos/apply-leave.dto';
import {
  CurrentUser,
  type UserPayload,
} from '../shared/decorators/user.decorator';
import { LeaveType, Status } from '@prisma/client';
import { LeaveFilterDto } from './dtos/leave-filter.dto';
import { LeaveFilterEmpDto } from './dtos/leave-filter-emp.dto';
import { ApproveRejectLeaveDto } from './dtos/approve-reject-leave.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { PaginatedLeaveResponseReturnType } from './return-types-swagger/getOwnLeaveRequests-swagger';
import { ApplyLeaveRecordReturnType } from './return-types-swagger/applyLeave-swagger';
import { ApproveLeaveRecordReturnType } from './return-types-swagger/approveLeave-swagger';
import { ReasonDto } from './dtos/reason.dto';
import { RejectLeaveRecordReturnType } from './return-types-swagger/rejectLeave-swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leaves')
export class LeaveManagerController {
  constructor(private leaveManagerService: LeaveManagerService) {}

  @ApiOkResponse({
    type: PaginatedLeaveResponseReturnType,
    isArray: true,
    description: 'Returns a list of leave balances',
  })
  @Roles(Role.EMPLOYEE, Role.MANAGER)
  @Get()
  async getOwnLeaveRequests(
    @CurrentUser() user: UserPayload,
    @Query() leaveFilterDto: LeaveFilterDto,
  ): Promise<PaginatedLeaveResponseReturnType> {
    if (!user || !user.employeeId) {
      throw new NotFoundException('User Not Valid');
    }
    const { status, type } = leaveFilterDto;
    // Validate Status if it is provided
    if (status && !Object.values(Status).includes(status)) {
      throw new BadRequestException(
        `Invalid status: ${status}. Must be PENDING, APPROVED, or REJECTED.`,
      );
    }

    // Validate Type if it is provided
    if (type && !Object.values(LeaveType).includes(type)) {
      throw new BadRequestException(
        `Invalid leave type: ${type}. Must be CASUAL, SICK, or PRIVILEGE.`,
      );
    }

    const requests = await this.leaveManagerService.getLeaveRequests(
      user.employeeId,
      leaveFilterDto,
    );
    return requests;
  }

  @ApiOkResponse({
    type: PaginatedLeaveResponseReturnType,
    isArray: true,
    description: 'Returns a list of leave balances for other employees',
  })
  @Roles(Role.MANAGER)
  @Get('/employees')
  async getOtherEmployeesLeaveRequests(
    @CurrentUser() user: UserPayload,
    @Query() leaveFilterDto: LeaveFilterEmpDto,
  ): Promise<PaginatedLeaveResponseReturnType> {
    if (!user || !user.employeeId) {
      throw new NotFoundException('User Not Valid');
    }

    const { status, type } = leaveFilterDto;

    // Validate Status if it is provided
    if (status && !Object.values(Status).includes(status)) {
      throw new BadRequestException(
        `Invalid status: ${status}. Must be PENDING, APPROVED, or REJECTED.`,
      );
    }

    // Validate Type if it is provided
    if (type && !Object.values(LeaveType).includes(type)) {
      throw new BadRequestException(
        `Invalid leave type: ${type}. Must be CASUAL, SICK, or PRIVILEGE.`,
      );
    }

    // requesting employee is the reportingManager, so have to fetch employees who has him as reportingManager.
    const requests =
      await this.leaveManagerService.getLeaveRequestsOfOtherEmpAsManager(
        user.employeeId,
        leaveFilterDto,
      );

    return requests;
  }

  @ApiOkResponse({ type: ApplyLeaveRecordReturnType })
  @Roles(Role.EMPLOYEE, Role.MANAGER)
  @Post('apply')
  applyRequest(
    @CurrentUser() user: UserPayload,
    @Body() applyLeaveDto: ApplyLeaveDto,
  ): Promise<ApplyLeaveRecordReturnType> {
    console.log(applyLeaveDto);
    if (!user.employeeId) {
      throw new NotFoundException('User Not Valid');
    }

    let reason = '';
    if(applyLeaveDto.reason) {
      reason = applyLeaveDto.reason;
    }
    return this.leaveManagerService.applyForLeave(
      user.employeeId,
      applyLeaveDto,
      reason
    );
  }

  @ApiOkResponse({ type: ApproveLeaveRecordReturnType })
  @Roles(Role.MANAGER)
  @Post('/employees/approve')
  async approveLeaveRequests(
    @CurrentUser() user: UserPayload,
    @Query() approveDto: ApproveRejectLeaveDto,
  ): Promise<ApproveLeaveRecordReturnType> {
    const { leaveId } = approveDto;
    if (!user.employeeId) {
      throw new NotFoundException('User Not Valid');
    }
    if (!leaveId) {
      throw new BadRequestException('leaveId must be a valid string');
    }
    console.log(leaveId);

    return this.leaveManagerService.approveLeaveRequest(
      user.employeeId,
      approveDto,
    );
  }

  @ApiOkResponse({ type: ApproveLeaveRecordReturnType })
  @Roles(Role.MANAGER)
  @Post('/employees/reject')
  async rejectLeaveRequest(
    @CurrentUser() user: UserPayload,
    @Query() rejectDto: ApproveRejectLeaveDto,
    @Body() reasonDto: ReasonDto
  ): Promise<RejectLeaveRecordReturnType> {
    const { leaveId } = rejectDto;
    if (!user.employeeId) {
      throw new NotFoundException('User Not Valid');
    }
    if (!leaveId) {
      throw new BadRequestException('leaveId must be a valid string');
    }
    let reason ='';
    if(reasonDto.reason) {
      reason = reasonDto.reason;
    }

    return this.leaveManagerService.rejectLeaveRequest(
      user.employeeId,
      rejectDto,
      reason
    );
  }

  @ApiOkResponse({ type: ApproveLeaveRecordReturnType })
  @Roles(Role.EMPLOYEE, Role.MANAGER)
  @Post('/employees/cancel')
  async cancelOwnLeaveRequest(
    @CurrentUser() user: UserPayload,
    @Query() cancelDto: ApproveRejectLeaveDto,
  ): Promise<ApproveLeaveRecordReturnType> {
    const { leaveId } = cancelDto;
    if (!user.employeeId) {
      throw new NotFoundException('User Not Valid');
    }
    if (!leaveId) {
      throw new BadRequestException('leaveId must be a valid string');
    }

    return this.leaveManagerService.cancelLeaveRequest(
      user.employeeId,
      cancelDto,
    );
  }
}

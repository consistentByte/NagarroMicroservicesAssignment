import {
  Controller,
  Get,
  NotFoundException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '../../../../shared/src/index';
import { ViewBalanceService } from './view-balance.service';
import {
  CurrentUser,
  type UserPayload,
} from '../shared/decorators/user.decorator';
import { ViewOwnBalanceDto } from './dtos/view-balance-own.dto';
import { ViewEmpBalanceDto } from './dtos/view-balance-emp.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { ViewBalanceOwnReturnType } from './return-types-swagger/view-balance-own-return';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('view-balance')
export class ViewBalanceController {
  constructor(private viewBalanceService: ViewBalanceService) {}

  @Get()
  @ApiOkResponse({
    type: ViewBalanceOwnReturnType,
    isArray: true,
    description: 'Returns a list of leave balances',
  })
  // @ApiQuery({ type: ViewOwnBalanceDto })
  @Roles(Role.EMPLOYEE, Role.MANAGER)
  @UseGuards(JwtAuthGuard)
  viewBalance(
    @CurrentUser() user: UserPayload,
    @Query() viewOwnBalDto: ViewOwnBalanceDto,
  ): Promise<ViewBalanceOwnReturnType[]> {
    if (!user.employeeId) {
      throw new NotFoundException('User Not Valid');
    }
    return this.viewBalanceService.getLeaveBalance(
      user.employeeId,
      viewOwnBalDto,
    );
  }

  @Get('/employee')
  @ApiOkResponse({
    type: ViewBalanceOwnReturnType,
    isArray: true,
    description: 'Returns a list of leave balances.',
  })
  // @ApiQuery({ type: ViewEmpBalanceDto })
  @Roles(Role.MANAGER)
  viewBalanceOfEmployee(
    @CurrentUser() user: UserPayload,
    @Query() viewEmpBalDto: ViewEmpBalanceDto,
  ): Promise<ViewBalanceOwnReturnType[]> {
    const { empId } = viewEmpBalDto;
    if (!empId || !user.employeeId) {
      throw new NotFoundException('User Not Valid');
    }

    if (empId === user.employeeId) {
      // user searching for his own
      return this.viewBalanceService.getLeaveBalance(
        user.employeeId,
        viewEmpBalDto,
      );
    } else {
      return this.viewBalanceService.getLeaveBalanceOfEmployeeByManager(
        user.employeeId,
        viewEmpBalDto,
      );
    }
  }
}

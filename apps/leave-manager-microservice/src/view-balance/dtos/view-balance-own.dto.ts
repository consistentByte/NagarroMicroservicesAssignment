import { ApiProperty } from '@nestjs/swagger';
import { LeaveType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ViewOwnBalanceDto {
  @ApiProperty({ enum: LeaveType, required: false })
  @IsOptional()
  @IsEnum(LeaveType, {
    message: 'Invalid leave type. Must be CASUAL, SICK, or PRIVILEGE',
  })
  type?: LeaveType;
}

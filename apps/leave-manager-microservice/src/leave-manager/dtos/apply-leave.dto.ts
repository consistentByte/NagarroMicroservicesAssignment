import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveType } from '@prisma/client';

export class ApplyLeaveDto {
  @ApiProperty({ example: '2026-06-05', description: 'Start date of the leave' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({ example: '2026-06-10', description: 'End date of the leave' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @ApiProperty({ enum: LeaveType, description: 'Type of leave' })
  @IsNotEmpty()
  @IsEnum(LeaveType)
  type!: LeaveType;
}
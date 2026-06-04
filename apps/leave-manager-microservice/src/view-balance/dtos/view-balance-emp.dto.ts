import { ApiProperty } from '@nestjs/swagger';
import { LeaveType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ViewEmpBalanceDto {
  @ApiProperty({ enum: LeaveType, required: false }) // Add this
  @IsOptional()
  @IsEnum(LeaveType, {
    message: 'Invalid leave type. Must be CASUAL, SICK, or PRIVILEGE',
  })
  type?: LeaveType;

  @ApiProperty({
    required: false,
    description: 'The unique identifier for the employee',
    example: 'EMP-12345',
  })
  @IsOptional()
  @IsString()
  empId?: string;
}

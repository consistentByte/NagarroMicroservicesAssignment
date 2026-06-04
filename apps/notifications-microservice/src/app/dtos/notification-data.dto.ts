import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum LeaveType {
  SICK = 'SICK',
  CASUAL = 'CASUAL',
  PRIVILEGE = 'PRIVILEGE',
}

export enum LeaveStatus {
  CANCELLED = 'CANCELLED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export class NotificationDataDto {
  @IsString()
  leaveId!: string;

  @IsString()
  employeeId!: string;

  @IsString()
  employeeName!: string;

  @IsString()
  @IsOptional()
  reportingManagerId?: string;

  @IsString()
  @IsOptional()
  reportingManagerName?: string;

  @IsEnum(LeaveType)
  type!: LeaveType;

  @Type(() => Date) // convert to date
  @IsDate()
  @IsOptional()
  startDate!: string;

  @Type(() => Date) // convert to date
  @IsDate()
  @IsOptional()
  endDate!: string;

  @IsEnum(LeaveStatus)
  status!: LeaveStatus;

  @IsString()
  @IsOptional()
  duration?: string;
}

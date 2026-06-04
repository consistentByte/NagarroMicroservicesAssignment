import { ApiProperty } from '@nestjs/swagger';
import { LeaveType, Status } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class LeaveFilterDto {
  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @ApiProperty({ example: 10, description: 'Limit per page', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100 per request' })
  limit: number = 10;

  @ApiProperty({
    enum: LeaveType,
    description: 'Filter by leave type',
    required: false,
  })
  @IsOptional()
  @IsEnum(LeaveType, {
    message: 'Invalid leave type. Must be CASUAL, SICK, or PRIVILEGE',
  })
  type?: LeaveType;

  @ApiProperty({
    enum: Status,
    description: 'Filter by leave status',
    required: false,
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'Invalid status. Must be PENDING, APPROVED, or REJECTED.',
  })
  status?: Status;
}

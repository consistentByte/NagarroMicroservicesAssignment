import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveType } from '@prisma/client';

export class ApplyLeaveDto {
  @ApiProperty({
    example: '2026-06-05',
    description: 'Start date of the leave',
  })
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

  @ApiPropertyOptional({
    description: 'The reason for the request',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100, { message: 'Reason must be under 100 characters' })
  @IsOptional()
  reason?: string;
}

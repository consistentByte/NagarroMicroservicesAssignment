import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class ApproveLeaveRecordReturnType {
  @ApiProperty({
    enum: $Enums.Status,
    description: 'Current status of the leave request',
  })
  status!: $Enums.Status;

  @ApiProperty({ enum: $Enums.LeaveType, description: 'Category of the leave' })
  type!: $Enums.LeaveType;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the leave',
  })
  id!: string;

  @ApiProperty({
    example: '12345',
    description: 'Unique identifier for the employee',
  })
  employeeId!: string;

  @ApiProperty({
    example: '2026-06-04T09:00:00Z',
    description: 'Start date of the leave',
  })
  startDate!: Date;

  @ApiProperty({
    example: '2026-06-06T17:00:00Z',
    description: 'End date of the leave',
  })
  endDate!: Date;

  @ApiProperty({
    example: '98765',
    description: 'Unique identifier for the reporting manager',
  })
  reportingManagerId!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class LeaveRecordReturnType {
  @ApiProperty({ enum: $Enums.Status })
  status!: $Enums.Status;

  @ApiProperty({ enum: $Enums.LeaveType })
  type!: $Enums.LeaveType;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  employeeId!: string;

  @ApiProperty()
  startDate!: Date;

  @ApiProperty()
  endDate!: Date;

  @ApiProperty()
  reportingManagerId!: string;
}

export class PaginationMetaReturnType {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class PaginatedLeaveResponseReturnType {
  @ApiProperty({ type: [LeaveRecordReturnType] })
  data!: LeaveRecordReturnType[];

  @ApiProperty({ type: PaginationMetaReturnType })
  pagination!: PaginationMetaReturnType;
}

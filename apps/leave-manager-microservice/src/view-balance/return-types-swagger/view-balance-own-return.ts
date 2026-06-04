import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class ViewBalanceOwnReturnType {
  @ApiProperty({
    enum: $Enums.LeaveType,
    description: 'The category of the leave',
  })
  type!: $Enums.LeaveType;

  @ApiProperty({
    example: 10,
    description: 'The remaining balance for this leave type',
  })
  balance!: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveRejectLeaveDto {
  @ApiProperty({
    required: false,
    description: 'The unique identifier for the leave',
  })
  @IsNotEmpty()
  @IsString()
  leaveId!: string;
}

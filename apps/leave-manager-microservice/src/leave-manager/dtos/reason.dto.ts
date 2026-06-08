import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReasonDto {
  @ApiPropertyOptional({
    description: 'The reason for the request',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100, { message: 'Reason must be under 100 characters' })
  @IsOptional()
  reason?: string;
}

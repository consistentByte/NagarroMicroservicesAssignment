import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AuthPayloadDto {
  @ApiProperty({
    example: 'EMP-12345',
    description: 'Employee unique identifier',
  })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Employee password',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

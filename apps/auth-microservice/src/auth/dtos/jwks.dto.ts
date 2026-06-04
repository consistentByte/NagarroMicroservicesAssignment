import { ApiProperty } from '@nestjs/swagger';

export class JwksDto {
  @ApiProperty({ example: 'RSA' })
  kty!: string;

  @ApiProperty({ example: 'sig' })
  use!: string;

  @ApiProperty({ example: 'RS256' })
  alg!: string;

  @ApiProperty({ example: 'auth-key-v1' })
  kid!: string;

  @ApiProperty({ description: 'Modulus' })
  n!: string;

  @ApiProperty({ description: 'Exponent' })
  e!: string;
}

export class JwksRootDto {
  @ApiProperty({ type: [JwksDto] })
  keys!: JwksDto[];
}

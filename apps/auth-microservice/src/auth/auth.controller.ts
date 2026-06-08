import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthPayloadDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { pem2jwk } from 'pem-jwk';
import fs from 'fs';
import path from 'path';
import { PinoLogger } from 'nestjs-pino';
import { AppService } from '../app/app.service';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { JwksRootDto } from './dtos/jwks.dto';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private logger: PinoLogger,
  ) {
    this.logger.setContext(AppService.name);
  }

  //   @Post('login')
  //   @UseGuards(LocalGuard)
  //   login(@Body() authPayload: AuthPayloadDto) {
  //     // const user = this.authService.validateUser(authPayload);
  //     // if (!user) {
  //     //   throw new HttpException('Invalid Credentials', 401);
  //     // }
  //     // return user;
  //     // Above validation is handled via local strategy

  //     // passport attaches a dynamic user property.
  //   }

  @ApiBody({ type: AuthPayloadDto })
  @ApiOkResponse({
    description: 'Returns the raw JWT token',
    type: String,
    schema: { type: 'string' },
  })
  @Post('login')
  @UseGuards(LocalGuard)
  login(@Req() req: Request): string {
    return req.user as any;
  }

  @ApiOkResponse({
    description: 'Returns the JSON Web Key Set (JWKS)',
    type: JwksRootDto,
  })
  @Get('jwks.json')
  getJwks() {
    // 1. Read actual public.pem file
    const publicKeyPem = fs.readFileSync(
      // path.join(process.cwd(), 'apps/auth-microservice/keys/public.pem'), // when not using docker
      path.join(process.cwd(), 'keys', 'public.pem'), // when using docker
      'utf8',
    );

    // 2. Convert it to JWK components automatically (generates 'n' and 'e')
    const jwkProps = pem2jwk(publicKeyPem);
    this.logger.info('Sent jwks');
    // 3. Return the properly formatted JWKS
    return {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          alg: 'RS256',
          kid: 'auth-key-v1',
          n: jwkProps.n, // Dynamically inserted Modulus
          e: jwkProps.e, // Dynamically inserted Exponent
        },
      ],
    };
  }
}

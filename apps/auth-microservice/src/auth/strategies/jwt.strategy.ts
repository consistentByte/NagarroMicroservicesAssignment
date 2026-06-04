import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import fs from 'fs';
import path from 'path';
import { AppService } from '../../app/app.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly logger: PinoLogger) {
    const publicKey = fs.readFileSync(
      // path.join(process.cwd(), 'apps/auth-microservice/keys/public.pem'),
      path.join(process.cwd(), 'keys', 'public.pem'),
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
    this.logger.setContext(AppService.name);
  }

  override validate(payload: any) {
    this.logger.debug('Inside Jwt', payload);
    return payload;
  }
}

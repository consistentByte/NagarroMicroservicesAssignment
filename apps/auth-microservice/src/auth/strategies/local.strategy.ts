import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppService } from '../../app/app.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly logger: PinoLogger,
  ) {
    super({ usernameField: 'employeeId', passwordField: 'password' });
    this.logger.setContext(AppService.name);
  }

  // validate method gives us username and password as two separate arguments.
  async validate(employeeId: string, password: string) {
    console.log('In Local Strategy');
    const user = await this.authService.validateUser({ employeeId, password });
    if (!user) {
      throw new UnauthorizedException();
    }
    this.logger.debug('user validated');
    return user;
  }
}

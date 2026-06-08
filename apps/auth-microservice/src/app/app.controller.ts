import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { PinoLogger } from 'nestjs-pino';

@Controller('test')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppService.name);
  }

  @Get('health')
  checkHealth() {
    return { status: 'UP' };
  }

  @Get('test-breaker')
  async testBreaker() {
    await new Promise((resolve) => setTimeout(resolve, 30000));
    return { success: true };
  }
}

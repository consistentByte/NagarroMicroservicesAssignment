import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  checkHealth() {
    return { status: 'UP' };
  }

  @Get('test-breaker')
  async testBreaker() {
    await new Promise((resolve) => setTimeout(resolve, 15000));
    return { success: true };
  }
}

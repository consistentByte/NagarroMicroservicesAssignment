import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getData() {
    return { msg: 'UP' };
  }

  @Get('test-breaker')
  async testBreaker() {
    // Simulate a hanging downstream service to trigger the 3000ms timeout
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return { success: true };
  }
}

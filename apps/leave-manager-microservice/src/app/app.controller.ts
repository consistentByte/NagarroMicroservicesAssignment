import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { NOTIFICATION_CLIENT } from '../shared/constants';
import { ClientProxy } from '@nestjs/microservices';

@Controller('test')
export class AppController {
  constructor(private readonly appService: AppService,
      @Inject(NOTIFICATION_CLIENT)    private readonly notificationRMQClient: ClientProxy) {}

  @Get('health')
  getData() {
    return { msg: 'UP' };
  }

  @Get('/notifications/health')
  getNotificationsHealth() {
    return this.notificationRMQClient.send('health','')
  }

  @Get('test-breaker')
  async testBreaker() {
    // Simulate a hanging downstream service to trigger the 15000ms timeout
    await new Promise((resolve) => setTimeout(resolve, 15000));
    return { success: true };
  }

  @Get('test-breaker-long')
  async testBreakerLong() {
    // Simulate a hanging downstream service to trigger the 31000ms timeout
    await new Promise((resolve) => setTimeout(resolve, 31000)); // object is to fail service until timeout, can be used to test that one instance down but other working.
    return { success: true };
  }}



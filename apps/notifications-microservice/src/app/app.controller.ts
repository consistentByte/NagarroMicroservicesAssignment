import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { NotificationDataDto } from './dtos/notification-data.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppService.name);
  }

  @MessagePattern('health')
  getData() {
    return { msg: 'UP' };
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @MessagePattern('leave-apply')
  notificationForApplyLeave(@Payload() data: NotificationDataDto) {
    return this.appService.sendNotificationForLeaveApply(data);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @MessagePattern('leave-approved')
  notificationForApplyApproved(@Payload() data: NotificationDataDto) {
    return this.appService.sendNotificationForLeaveApproved(data);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @MessagePattern('leave-rejected')
  notificationForApplyRejected(@Payload() data: NotificationDataDto) {
    return this.appService.sendNotificationForLeaveRejected(data);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @MessagePattern('leave-cancelled')
  notificationForApplyCancelled(@Payload() data: NotificationDataDto) {
    return this.appService.sendNotificationForLeaveCancelled(data);
  }
}

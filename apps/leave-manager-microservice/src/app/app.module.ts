import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../../../../shared/src/lib/auth/auth.module';
import { LeaveManagerModule } from '../leave-manager/leave-manager.module';
import { ViewBalanceModule } from '../view-balance/view-balance.module';
import { SharedMessagingModule } from '../shared/mq/messaging.module';
import { SharedLoggerModule } from '../../../../shared/src/lib/logger/logger.module';
import { CircuitBreakerInterceptor } from '../../../../shared/src/lib/util-circuit-breaker/circuit-breaker.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    ViewBalanceModule,
    LeaveManagerModule,
    SharedMessagingModule.register(),
    SharedLoggerModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CircuitBreakerInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}

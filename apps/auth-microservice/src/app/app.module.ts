import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { SharedLoggerModule } from '../../../../shared/src/lib/logger/logger.module';
import { CircuitBreakerInterceptor } from '../../../../shared/src/lib/util-circuit-breaker/circuit-breaker.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [AuthModule, SharedLoggerModule.forRoot()],
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

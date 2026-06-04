import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedLoggerModule } from '../../../../shared/src/lib/logger/logger.module';

@Module({
  imports: [SharedLoggerModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

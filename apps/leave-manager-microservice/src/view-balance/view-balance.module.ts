import { Module } from '@nestjs/common';
import { ViewBalanceService } from './view-balance.service';
import { ViewBalanceController } from './view-balance.controller';
import { AuthModule } from '../../../../shared/src/index';
import { PrismaModule } from '../prisma/prisma.module';


@Module({
  controllers: [ViewBalanceController],
  imports: [PrismaModule, AuthModule],
  providers: [ViewBalanceService],
  exports: [ViewBalanceService],
})
export class ViewBalanceModule {}

import { Module } from '@nestjs/common';
import { LeaveManagerController } from './leave-manager.controller';
import { LeaveManagerService } from './leave-manager.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ViewBalanceModule } from '../view-balance/view-balance.module';

@Module({
  controllers: [LeaveManagerController],
  imports: [PrismaModule, ViewBalanceModule],
  providers: [LeaveManagerService],
  exports: [],
})
export class LeaveManagerModule {}

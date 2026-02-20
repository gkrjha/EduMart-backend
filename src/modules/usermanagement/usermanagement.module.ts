import { Module } from '@nestjs/common';
import { UsermanagementService } from './usermanagement.service';
import { UsermanagementController } from './usermanagement.controller';

@Module({
  providers: [UsermanagementService],
  controllers: [UsermanagementController]
})
export class UsermanagementModule {}

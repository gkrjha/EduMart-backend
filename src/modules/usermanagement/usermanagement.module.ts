import { Module } from '@nestjs/common';
import { UsermanagementService } from './usermanagement.service';
import { UsermanagementController } from './usermanagement.controller';
import { Usermanagement } from './entities/usermanagement.entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Usermanagement])],
  providers: [UsermanagementService],
  controllers: [UsermanagementController],
  exports: [UsermanagementService],
})
export class UsermanagementModule {}

import { Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entities';
import { UsermanagementModule } from '../usermanagement/usermanagement.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), UsermanagementModule],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}

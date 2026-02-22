import { Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entities';
import { UsermanagementModule } from '../usermanagement/usermanagement.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    UsermanagementModule,
    CloudinaryModule,
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}

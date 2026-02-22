import { Module } from '@nestjs/common';
import { MulterController } from './multer.controller';
import { MulterService } from './multer.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [MulterController],
  providers: [MulterService],
})
export class MulterModule {}

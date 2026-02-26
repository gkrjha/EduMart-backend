import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { Certificate } from './entities/certificate.entity';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, Certificate]),
    CloudinaryModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService]
})
export class TeachersModule {}

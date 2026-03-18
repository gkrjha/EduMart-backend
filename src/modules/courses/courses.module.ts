import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entities';
import { Specialization } from '../specializations/entities/specialization.entity';
import { Content } from '../content/entities/content.entity';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [TypeOrmModule.forFeature([Course, Specialization, Content])],
})
export class CoursesModule {}

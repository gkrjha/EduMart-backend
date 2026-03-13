import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { Rating } from './entities/rating.entity';
import { Course } from '../courses/entities/course.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Course])],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}

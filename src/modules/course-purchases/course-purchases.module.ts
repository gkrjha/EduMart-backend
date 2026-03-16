import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CoursePurchasesService } from './course-purchases.service';
import { CoursePurchasesController } from './course-purchases.controller';
import { CoursePurchase } from './entities/course-purchase.entity';
import { Course } from '../courses/entities/course.entities';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CoursePurchase, Course]),
  ],
  controllers: [CoursePurchasesController],
  providers: [CoursePurchasesService, PaymentService],
  exports: [CoursePurchasesService],
})
export class CoursePurchasesModule {}

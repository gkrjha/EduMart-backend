import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { PaymentGateway } from '../entities/course-purchase.entity';

export class CreateCoursePurchaseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  course_id: string;

  @ApiProperty({ enum: PaymentGateway, example: PaymentGateway.STRIPE })
  @IsEnum(PaymentGateway)
  payment_gateway: PaymentGateway;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: '2027-03-16T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expire_at?: string;
}

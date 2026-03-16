import { PartialType } from '@nestjs/swagger';
import { CreateCoursePurchaseDto } from './create-course-purchase.dto';

export class UpdateCoursePurchaseDto extends PartialType(
  CreateCoursePurchaseDto,
) {}

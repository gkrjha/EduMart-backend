import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsOptional, IsNumberString } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty({
    description: 'Average rating of the course',
    example: '4.5',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  avg_rating?: string;
}

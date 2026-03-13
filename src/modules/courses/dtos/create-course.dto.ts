import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumberString,
  IsIn,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Title of the course',
    example: 'Full Stack Web Development',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Learn full stack development from scratch',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Course price',
    example: '99.99',
  })
  @IsNotEmpty()
  @IsNumberString()
  price: string;

  @ApiProperty({
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  specializationNames: string[];
}

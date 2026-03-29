import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ description: 'Rating value (1 to 5)', example: 4, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Review message', example: 'Great course!' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Course ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}

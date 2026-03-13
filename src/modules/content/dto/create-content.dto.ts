import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ContentType } from '../entities/content.entity';

export class CreateContentDto {
  @ApiProperty({
    description: 'Title of the content',
    example: 'Introduction to JavaScript',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Type of content',
    enum: ContentType,
    example: ContentType.VIDEO,
  })
  @IsNotEmpty()
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({
    description: 'Video link (required if type is video)',
    example: 'https://youtube.com/watch?v=xyz',
    required: false,
  })
  @ValidateIf((o) => o.type === ContentType.VIDEO)
  @IsNotEmpty()
  @IsString()
  video_link?: string;

  @ApiProperty({
    description: 'PDF link (required if type is pdf)',
    example: 'https://example.com/file.pdf',
    required: false,
  })
  @ValidateIf((o) => o.type === ContentType.PDF)
  @IsNotEmpty()
  @IsString()
  pdf_link?: string;

  @ApiProperty({
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}

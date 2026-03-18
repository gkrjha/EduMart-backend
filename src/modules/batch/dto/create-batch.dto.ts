import { ApiProperty } from '@nestjs/swagger';
import {
  Matches,
  IsUUID,
  IsArray,
  IsEnum,
  ArrayNotEmpty,
} from 'class-validator';
import { WeekDays } from 'src/common/enums/enum';

export class CreateBatchDto {
  @ApiProperty({ example: '16:30' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:mm format (24-hour)',
  })
  startTime: string;

  @ApiProperty({ example: '18:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:mm format (24-hour)',
  })
  endTime: string;

  @ApiProperty()
  @IsUUID()
  course_id: string;

  @ApiProperty()
  @IsUUID()
  teacher_id: string;

  @ApiProperty({ enum: WeekDays, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(WeekDays, { each: true })
  days: WeekDays[];
}

import { PartialType } from '@nestjs/swagger';
import { TeacherDTO } from './teacher.dto';

export class UpdateTeacherDto extends PartialType(TeacherDTO) {}

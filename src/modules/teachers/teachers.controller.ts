import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { TeacherDTO } from './dtos/teacher.dto';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';
import { Teacher } from './entities/teacher.entity';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { TeachersService } from './teachers.service';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) {}
  @Post('create-teacher')
  @ApiBody({ type: TeacherDTO })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profile', maxCount: 1 },
      { name: 'x_certificate', maxCount: 1 },
      { name: 'xii_certificate', maxCount: 1 },
      { name: 'bachlor_certificate', maxCount: 1 },
      { name: 'master_certificate', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async createTeacher(
    @Body() teacher: TeacherDTO,
    @Req() req,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      x_certificate?: Express.Multer.File[];
      xii_certificate?: Express.Multer.File[];
      bachlor_certificate?: Express.Multer.File[];
      master_certificate?: Express.Multer.File[];
    },
  ): Promise<Teacher> {
    return this.teacherService.create(teacher, req.user.id, files);
  }

  @Patch('update/:id')
  
}

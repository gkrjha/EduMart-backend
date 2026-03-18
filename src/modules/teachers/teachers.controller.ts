import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  SetMetadata,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
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
import { UpdateTeacherDto } from './dtos/updateteacher.dto';
import { memoryStorage } from 'multer';
import { Role } from 'src/common/enums/enum';

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
      { name: 'phD', maxCount: 1 },
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
      profile?: Express.Multer.File;
      x_certificate?: Express.Multer.File;
      xii_certificate?: Express.Multer.File;
      bachlor_certificate?: Express.Multer.File;
      master_certificate?: Express.Multer.File;
      phD?: Express.Multer.File;
    },
  ): Promise<Teacher | null> {
    return this.teacherService.create(teacher, req.user.id, files);
  }

  @Patch('update/:id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'master_certificate', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
      },
    ),
  )
  async updateTeacher(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() teacherDto: UpdateTeacherDto,
    @Req() req,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      master_certificate?: Express.Multer.File[];
    },
  ) {
    const authId = req.user.id;
    if (authId !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }
    return this.teacherService.update(id, teacherDto, {
      profile: files?.profile?.[0],
      master_certificate: files?.master_certificate?.[0],
    });
  }
  @Get('find-all')
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req): Promise<Teacher[]> {
    const search = req.query.search as string;
    return this.teacherService.findall(search);
  }

  @Get('find-one/:id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.teacherService.findOne(id);
  }

  @SetMetadata('roles', [Role.ADMIN, Role.TEACHER])
  @Delete('delete/:id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.teacherService.delete(id);
  }
}

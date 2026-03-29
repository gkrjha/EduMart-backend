import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/common/decorators/get-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TeacherDTO } from './dtos/teacher.dto';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/enum';
import { Teacher } from './entities/teacher.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TeachersService } from './teachers.service';
import { UpdateTeacherDto } from './dtos/updateteacher.dto';
import { memoryStorage } from 'multer';

@ApiTags('Teachers')
@Controller('teachers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) { }

  @Post('create-teacher')
  @Roles(Role.ADMIN)
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
  async createTeacher(
    @Body() teacher: TeacherDTO,
    @User() user: AuthUser,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      x_certificate?: Express.Multer.File[];
      xii_certificate?: Express.Multer.File[];
      bachlor_certificate?: Express.Multer.File[];
      master_certificate?: Express.Multer.File[];
      phD?: Express.Multer.File[];
    },
  ): Promise<Teacher | null> {
    return this.teacherService.create(teacher, user.id, files as any);
  }

  @Patch('update/:id')
  @Roles(Role.TEACHER)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiConsumes('multipart/form-data')
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
    @User() user: AuthUser,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      master_certificate?: Express.Multer.File[];
    },
  ) {
    if (user.id !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }
    return this.teacherService.update(id, teacherDto, {
      profile: files?.profile?.[0],
      master_certificate: files?.master_certificate?.[0],
    });
  }

  @Get('find-all')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query('search') search?: string): Promise<Teacher[]> {
    return this.teacherService.findall(search ?? '');
  }

  @Get('find-one/:id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.teacherService.findOne(id);
  }

  @Delete('delete/:id')
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.teacherService.delete(id);
  }
}

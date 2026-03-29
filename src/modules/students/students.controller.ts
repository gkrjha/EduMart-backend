import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/common/decorators/get-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  // Public — registration open hai
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profile'))
  create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.studentsService.create(createStudentDto, file);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query('search') search?: string) {
    return this.studentsService.findAll(search);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @User() user: AuthUser,
  ) {
    // Student sirf apna profile dekh sakta hai
    if (user.role === Role.STUDENT && user.id !== id) {
      throw new UnauthorizedException('You can only view your own profile');
    }
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profile'))
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @User() user: AuthUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Student sirf apna profile update kar sakta hai
    if (user.role === Role.STUDENT && user.id !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }
    return this.studentsService.update(id, updateStudentDto, file);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @User() user: AuthUser,
  ) {
    // Student sirf apna account delete kar sakta hai
    if (user.role === Role.STUDENT && user.id !== id) {
      throw new UnauthorizedException('You can only delete your own account');
    }
    return this.studentsService.remove(id);
  }
}

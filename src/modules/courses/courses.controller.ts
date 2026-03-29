import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/enum';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { User } from 'src/common/decorators/get-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';

@Controller('courses')
@ApiTags('courses')
export class CoursesController {
  constructor(private readonly courseServices: CoursesService) { }

  @Post('create-course')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async create(@Body() dto: CreateCourseDto, @User() user: AuthUser) {
    // Teacher ne create kiya toh uska id store karo, admin ne kiya toh null
    const teacherId = user.role === Role.TEACHER ? user.id : undefined;
    return this.courseServices.create(dto, teacherId);
  }

  @Get('my-courses')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get courses created by logged-in teacher' })
  async getMyCourses(@User() user: AuthUser) {
    return this.courseServices.findByTeacher(user.id);
  }

  // Public — koi bhi courses dekh sakta hai
  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'specialization', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  async findAll(
    @Query('search') search?: string,
    @Query('specialization') specialization?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.courseServices.findAll(search, specialization, minPrice, maxPrice);
  }

  // Public — single course detail
  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  async findOne(@Param('id') id: string) {
    return this.courseServices.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Update a course' })
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.courseServices.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a course' })
  async remove(@Param('id') id: string) {
    return this.courseServices.remove(id);
  }
}

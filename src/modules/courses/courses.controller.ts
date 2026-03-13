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
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { CoursesService } from './courses.service';

@Controller('courses')
@ApiTags('courses')
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly courseServices: CoursesService) {}

  @Post('create-course')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 404, description: 'Specializations not found' })
  async create(@Body() dto: CreateCourseDto) {
    return this.courseServices.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'List of all courses' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by course title or description',
    type: String,
  })
  @ApiQuery({
    name: 'specialization',
    required: false,
    description: 'Filter by specialization name',
    type: String,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    type: Number,
  })
  async findAll(
    @Query('search') search?: string,
    @Query('specialization') specialization?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.courseServices.findAll(
      search,
      specialization,
      minPrice,
      maxPrice,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string) {
    return this.courseServices.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.courseServices.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string) {
    return this.courseServices.remove(id);
  }
}

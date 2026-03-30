import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/common/decorators/get-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';

@ApiTags('Rating')
@Controller('rating')
@ApiBearerAuth()
export class RatingController {
  constructor(private readonly ratingService: RatingService) { }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create or update rating (students only)' })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 403, description: 'Only students can rate a course' })
  create(
    @Body() createRatingDto: CreateRatingDto,
    @User() user: AuthUser,
  ) {
    return this.ratingService.create(createRatingDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ratings' })
  @ApiResponse({ status: 200, description: 'List of all ratings' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filter by course ID' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
  findAll(
    @Query('courseId') courseId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.ratingService.findAll(courseId, studentId);
  }

  @Get('course/:courseId/average')
  @ApiOperation({ summary: 'Get average rating for course' })
  @ApiResponse({ status: 200, description: 'Average rating' })
  getAverageRating(@Param('courseId') courseId: string) {
    return this.ratingService.getAverageRating(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rating by ID' })
  @ApiResponse({ status: 200, description: 'Rating found' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  findOne(@Param('id') id: string) {
    return this.ratingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rating' })
  @ApiResponse({ status: 200, description: 'Rating updated successfully' })
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingService.update(id, updateRatingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete rating' })
  @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  remove(@Param('id') id: string) {
    return this.ratingService.remove(id);
  }
}

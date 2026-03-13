import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Course } from '../courses/entities/course.entities';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    if (createRatingDto.rating < 1 || createRatingDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const course = await this.courseRepository.findOne({
      where: { id: createRatingDto.course_id },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createRatingDto.course_id} not found`,
      );
    }

    const existing = await this.ratingRepository.findOne({
      where: {
        student_id: createRatingDto.student_id,
        course_id: createRatingDto.course_id,
      },
    });

    let rating: Rating;
    if (existing) {
      existing.rating = createRatingDto.rating;
      rating = await this.ratingRepository.save(existing);
    } else {
      const newRating = this.ratingRepository.create(createRatingDto);
      rating = await this.ratingRepository.save(newRating);
    }

    await this.updateCourseAverageRating(createRatingDto.course_id);
    return rating;
  }

  async findAll(courseId?: string, studentId?: string): Promise<Rating[]> {
    const query = this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.student', 'student')
      .leftJoinAndSelect('rating.course', 'course');

    if (courseId) {
      query.andWhere('rating.course_id = :courseId', { courseId });
    }

    if (studentId) {
      query.andWhere('rating.student_id = :studentId', { studentId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['student', 'course'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    return rating;
  }

  async getAverageRating(
    courseId: string,
  ): Promise<{ average: number; count: number }> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.course_id = :courseId', { courseId })
      .getRawOne();

    return {
      average: parseFloat(result?.average || '0'),
      count: parseInt(result?.count || '0'),
    };
  }

  async update(id: string, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.findOne(id);

    if (updateRatingDto.rating < 1 || updateRatingDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    rating.rating = updateRatingDto.rating;
    const updatedRating = await this.ratingRepository.save(rating);

    await this.updateCourseAverageRating(rating.course_id);

    return updatedRating;
  }

  async remove(id: string): Promise<{ message: string }> {
    const rating = await this.findOne(id);
    const courseId = rating.course_id;

    await this.ratingRepository.remove(rating);
    await this.updateCourseAverageRating(courseId);

    return { message: 'Rating deleted successfully' };
  }

  private async updateCourseAverageRating(courseId: string): Promise<void> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .where('rating.course_id = :courseId', { courseId })
      .getRawOne();

    const averageRating = parseFloat(result?.average || '0');

    await this.courseRepository.update(courseId, {
      avg_rating: averageRating.toFixed(2),
    });
  }
}

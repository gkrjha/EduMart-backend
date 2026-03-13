import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { Course } from './entities/course.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Specialization } from '../specializations/entities/specialization.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
  ) {}

  async create(courseDto: CreateCourseDto): Promise<Course> {
    const { specializationNames, ...courseData } = courseDto;

    let specializations: Specialization[] = [];
    if (specializationNames && specializationNames.length > 0) {
      specializations = await this.specializationRepository.find({
        where: { name: In(specializationNames) },
      });

      if (specializations.length !== specializationNames.length) {
        const foundNames = specializations.map((s) => s.name);
        const notFound = specializationNames.filter(
          (name) => !foundNames.includes(name),
        );
        throw new NotFoundException(
          `Specializations not found: ${notFound.join(', ')}`,
        );
      }
    }

    const course = this.courseRepository.create({
      ...courseData,
      specializations,
    });

    const savedCourse = await this.courseRepository.save(course);

    const result = await this.courseRepository.findOne({
      where: { id: savedCourse.id },
      relations: ['specializations'],
    });

    if (!result) {
      throw new NotFoundException('Failed to retrieve created course');
    }

    return result;
  }

  async findAll(
    search?: string,
    specialization?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<Course[]> {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.specializations', 'specialization');
    if (search) {
      query.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (specialization) {
      query.andWhere('specialization.name = :specialization', {
        specialization,
      });
    }
    if (minPrice !== undefined) {
      query.andWhere('CAST(course.price AS DECIMAL) >= :minPrice', {
        minPrice,
      });
    }

    if (maxPrice !== undefined) {
      query.andWhere('CAST(course.price AS DECIMAL) <= :maxPrice', {
        maxPrice,
      });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['specializations'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    const { specializationNames, ...updateData } = updateDto;

    if (specializationNames !== undefined) {
      if (specializationNames.length > 0) {
        const specializations = await this.specializationRepository.find({
          where: { name: In(specializationNames) },
        });

        if (specializations.length !== specializationNames.length) {
          const foundNames = specializations.map((s) => s.name);
          const notFound = specializationNames.filter(
            (name) => !foundNames.includes(name),
          );
          throw new NotFoundException(
            `Specializations not found: ${notFound.join(', ')}`,
          );
        }

        course.specializations = specializations;
      } else {
        course.specializations = [];
      }
    }

    Object.assign(course, updateData);

    const updatedCourse = await this.courseRepository.save(course);

    const result = await this.courseRepository.findOne({
      where: { id: updatedCourse.id },
      relations: ['specializations'],
    });

    if (!result) {
      throw new NotFoundException('Failed to retrieve updated course');
    }

    return result;
  }

  async remove(id: string): Promise<{ message: string }> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
    return { message: 'Course deleted successfully' };
  }
}

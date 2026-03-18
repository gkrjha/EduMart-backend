import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { Teacher } from '../teachers/entities/teacher.entity';

@Injectable()
export class BatchService {
  private batchRepository: Repository<Batch>;
  private teacherRepository: Repository<Teacher>;

  constructor(private readonly dataSource: DataSource) {
    this.batchRepository = this.dataSource.getRepository(Batch);
    this.teacherRepository = this.dataSource.getRepository(Teacher);
  }

  async create(createBatchDto: CreateBatchDto) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: createBatchDto.teacher_id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const batch = this.batchRepository.create({
      startTime: createBatchDto.startTime,
      endTime: createBatchDto.endTime,
      course_id: createBatchDto.course_id,
      teacher: teacher,
      days: createBatchDto.days,
    });

    return await this.batchRepository.save(batch);
  }

  async findAll() {
    return await this.batchRepository.find({
      relations: ['teacher'],
    });
  }

  async findOne(id: string) {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return batch;
  }

  async update(id: string, updateBatchDto: UpdateBatchDto) {
    const batch = await this.findOne(id);

    if (updateBatchDto.teacher_id) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: updateBatchDto.teacher_id },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
      batch.teacher = teacher;
    }

    if (updateBatchDto.startTime) batch.startTime = updateBatchDto.startTime;
    if (updateBatchDto.endTime) batch.endTime = updateBatchDto.endTime;
    if (updateBatchDto.course_id) batch.course_id = updateBatchDto.course_id;
    if (updateBatchDto.days) batch.days = updateBatchDto.days;

    return await this.batchRepository.save(batch);
  }

  async remove(id: string) {
    const batch = await this.findOne(id);
    await this.batchRepository.remove(batch);
    return { message: 'Batch deleted successfully' };
  }
}

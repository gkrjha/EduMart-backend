import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Specialization } from './entities/specialization.entity';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';

@Injectable()
export class SpecializationsService {
  private specializationRepository: Repository<Specialization>;

  constructor(private readonly dataSource: DataSource) {
    this.specializationRepository =
      this.dataSource.getRepository(Specialization);
  }

  async create(createSpecializationDto: CreateSpecializationDto) {
    const exists = await this.specializationRepository.findOne({
      where: { name: createSpecializationDto.name },
    });

    if (exists) {
      throw new BadRequestException('Specialization already exists');
    }

    const specialization = this.specializationRepository.create(
      createSpecializationDto,
    );
    return await this.specializationRepository.save(specialization);
  }

  async findAll() {
    return await this.specializationRepository.find();
  }

  async findOne(id: string) {
    const specialization = await this.specializationRepository.findOne({
      where: { id },
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    return specialization;
  }

  async update(id: string, updateSpecializationDto: UpdateSpecializationDto) {
    const specialization = await this.findOne(id);

    if (
      updateSpecializationDto.name &&
      updateSpecializationDto.name !== specialization.name
    ) {
      const exists = await this.specializationRepository.findOne({
        where: { name: updateSpecializationDto.name },
      });

      if (exists) {
        throw new BadRequestException('Specialization name already exists');
      }
    }

    Object.assign(specialization, updateSpecializationDto);
    return await this.specializationRepository.save(specialization);
  }

  async remove(id: string) {
    const specialization = await this.findOne(id);
    await this.specializationRepository.remove(specialization);
    return { message: 'Specialization deleted successfully' };
  }
}

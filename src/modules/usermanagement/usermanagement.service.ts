import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usermanagement } from './entities/usermanagement.entities';
import { UsermanagementDto } from './dot/usermanagement.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsermanagementService {
  constructor(
    @InjectRepository(Usermanagement)
    private readonly userRepository: Repository<Usermanagement>,
  ) {}

  async create(usermanagementdot: UsermanagementDto): Promise<Usermanagement> {
    const isEmail = await this.userRepository.findOne({
      where: { email: usermanagementdot.email },
    });
    if (isEmail) {
      throw new Error('Email already exists');
    }
    const user = this.userRepository.create(usermanagementdot);
    return this.userRepository.save(user);
  }
}

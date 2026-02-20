import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/admin.dto';
import { Admin } from './entities/admin.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsermanagementService } from '../usermanagement/usermanagement.service';
@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly userService: UsermanagementService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const isEmail = await this.adminRepository.findOne({
      where: { email: createAdminDto.email },
    });

    const hashPassword = await bcrypt.hash(createAdminDto.password, 12);

    if (isEmail) {
      throw new BadRequestException('User already registered');
    }

    const admin = this.adminRepository.create(createAdminDto);

    const savedAdmin = await this.adminRepository.save(admin);

    const data = {
      ...savedAdmin,
      hashPassword,
    };

    try {
      await this.userService.create({
        name: data.name,
        email: data.email,
        password: hashPassword,
        role: data.role,
        refId: data.refId,
        status: data.status,
      });
    } catch (error) {
      console.error('Error creating user in Usermanagement:', error);
    }
    return savedAdmin;
  }
}

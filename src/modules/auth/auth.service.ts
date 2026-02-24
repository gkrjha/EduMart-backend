import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { DataSource } from 'typeorm';
import { Usermanagement } from '../usermanagement/entities/usermanagement.entities';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { stat } from 'fs';
@Injectable()
export class AuthService {
  constructor(
    private readonly dataSourse: DataSource,
    private readonly jwtService: JwtService,
  ) {}
  async login(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    const userRepository = await this.dataSourse.getRepository(Usermanagement);
    const isUserExist = await userRepository.findOne({
      where: { email: email },
    });

    if (!isUserExist) {
      throw new BadRequestException('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, isUserExist.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (isUserExist.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }
    switch (isUserExist.role) {
      case 'admin':
        const adminRepository = await this.dataSourse.getRepository('Admin');
        const admin = await adminRepository.findOne({
          where: { email: email },
        });
        return {
          message: 'Login Successful',
          admin: admin,
          access_token: this.jwtService.sign({
            id: isUserExist.refId,
            email: isUserExist.email,
            role: isUserExist.role,
          }),
        };
        break;
      case 'student':
        console.log('Student logged in');
        break;
      case 'teacher':
        console.log('Teacher logged in');
        break;
      default:
        console.log('Unknown role');
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}

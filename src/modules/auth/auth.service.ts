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
@Injectable()
export class AuthService {
  constructor(
    private readonly dataSourse: DataSource,
    private readonly jwtService: JwtService,
  ) {}
  async login(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    const userRepository = this.dataSourse.getRepository(Usermanagement);
    const isUserExist = await userRepository.findOne({
      where: { email: email },
      select: ['id', 'name', 'email', 'password', 'role', 'refId', 'status'],
    });

    if (!isUserExist) {
      throw new BadRequestException('User not found');
    }

    if (!password || !isUserExist.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, isUserExist.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (isUserExist.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    const accessToken = this.jwtService.sign({
      id: isUserExist.refId,
      email: isUserExist.email,
      role: isUserExist.role,
    });

    switch (isUserExist.role) {
      case 'admin': {
        const adminRepository = this.dataSourse.getRepository('Admin');
        const admin = await adminRepository.findOne({
          where: { email: email },
        });
        return {
          message: 'Login Successful',
          user: admin,
          role: 'admin',
          access_token: accessToken,
        };
      }
      case 'student': {
        const studentRepository = this.dataSourse.getRepository('Student');
        const student = await studentRepository.findOne({
          where: { email: email },
        });
        return {
          message: 'Login Successful',
          user: student,
          role: 'student',
          access_token: accessToken,
        };
      }
      case 'teacher': {
        const teacherRepository = this.dataSourse.getRepository('Teacher');
        const teacher = await teacherRepository.findOne({
          where: { email: email },
        });
        return {
          message: 'Login Successful',
          user: teacher,
          role: 'teacher',
          access_token: accessToken,
        };
      }
      default:
        throw new BadRequestException('Unknown role');
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

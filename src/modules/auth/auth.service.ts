import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
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
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role', 'refId'],
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

    const accessToken = this.jwtService.sign({
      id: isUserExist.refId,
      email: isUserExist.email,
      role: isUserExist.role,
    });

    const entityMap: Record<string, string> = {
      admin: 'Admin',
      student: 'Student',
      teacher: 'Teacher',
    };

    const entityName = entityMap[isUserExist.role];
    if (!entityName) {
      throw new BadRequestException('Unknown role');
    }

    const user = await this.dataSourse
      .getRepository(entityName)
      .findOne({ where: { email } });

    return {
      message: 'Login Successful',
      user,
      role: isUserExist.role,
      access_token: accessToken,
    };
  }
}

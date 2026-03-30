import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Admin } from 'src/modules/admins/entities/admin.entities';
import { Certificate } from 'src/modules/teachers/entities/certificate.entity';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';
import { Specialization } from 'src/modules/specializations/entities/specialization.entity';
import { Batch } from 'src/modules/batch/entities/batch.entity';
import { Student } from 'src/modules/students/entities/student.entity';
import { Course } from 'src/modules/courses/entities/course.entities';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) { }
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      username: this.configService.get<string>('DATABASE_USERNAME'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      synchronize: true,
      entities: [
        Admin,
        Teacher,
        Certificate,
        Specialization,
        Batch,
        Student,
        Course,
      ],
      migrationsRun: false,
      autoLoadEntities: true,
    };
  }
}

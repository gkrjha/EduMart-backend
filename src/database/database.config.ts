import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Admin } from 'src/modules/admins/entities/admin.entities';
import { Certificate } from 'src/modules/teachers/entities/certificate.entity';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      username: this.configService.get<string>('DATABASE_USERNAME'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      synchronize: true,
       entities: [Admin, Teacher, Certificate], 
      //logging: this.configService.get<string>('NODE_ENV') === 'development',
    //   logging: false,
      migrationsRun: false,
      autoLoadEntities: true,
    };
  }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './database/database.config';
import { UsermanagementModule } from './modules/usermanagement/usermanagement.module';
import { StudentsController } from './modules/students/students.controller';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AdminsModule } from './modules/admins/admins.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AuthModule } from './modules/auth/auth.module';
import { MulterModule } from './common/multer/multer.module';
import { JwtStrategy } from './common/jwt/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    MulterModule,
    UsermanagementModule,
    StudentsModule,
    TeachersModule,
    AdminsModule,
    AuthModule,
    CoursesModule,
  ],
  controllers: [AppController, StudentsController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}

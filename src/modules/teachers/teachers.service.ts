import { Injectable, NotFoundException } from '@nestjs/common';
import { TeacherDTO } from './dtos/teacher.dto';
import { DataSource } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { Teacher } from './entities/teacher.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Admin } from '../admins/entities/admin.entities';
import { Usermanagement } from '../usermanagement/entities/usermanagement.entities';
import * as bcrypt from 'bcrypt';
import { UpdateTeacherDto } from './dtos/updateteacher.dto';
@Injectable()
export class TeachersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    teacherDto: TeacherDTO,
    adminId: string,
    files: {
      profile?: Express.Multer.File[];
      x_certificate?: Express.Multer.File[];
      xii_certificate?: Express.Multer.File[];
      bachlor_certificate?: Express.Multer.File[];
      master_certificate?: Express.Multer.File[];
    },
  ) {
    return this.dataSource.transaction(async (manager) => {
      const hashPassword = await bcrypt.hash(teacherDto.password, 10);
      let profileUrl: string | undefined;
      if (files.profile?.[0]) {
        const uploaded = await this.cloudinaryService.uploadImage(
          files.profile[0],
          'teachers',
        );
        profileUrl = uploaded.secure_url;
      }
      const teacherEntity = manager.create(Teacher, {
        name: teacherDto.name,
        email: teacherDto.email,
        password: hashPassword,
        phone: teacherDto.phone,
        qualification: teacherDto.qualification,
        experience: teacherDto.experience,
        status: teacherDto.status,
        createdBy: { id: adminId } as any,
        profile: profileUrl,
      });
      const savedTeacher = await manager.save(teacherEntity);

      const certificateUrls: any = {};
      for (const key of [
        'x_certificate',
        'xii_certificate',
        'bachlor_certificate',
        'master_certificate',
      ]) {
        if (files[key]?.[0]) {
          const uploaded = await this.cloudinaryService.uploadImage(
            files[key][0],
            'certificates',
          );
          certificateUrls[key] = uploaded.secure_url;
        }
      }

      const certificateEntity = manager.create(Certificate, {
        ...certificateUrls,
        teacher: savedTeacher,
      });
      await manager.save(certificateEntity);

      const usermanagement = manager.create(Usermanagement, {
        name: teacherDto.name,
        email: teacherDto.email,
        password: hashPassword,
        role: 'teacher',
        refId: savedTeacher.id,
        status: teacherDto.status,
      });

      await manager.save(usermanagement);

      return savedTeacher;
    });
  }

  async update(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
    files: {
      profile?: Express.Multer.File[];
      master_certificate?: Express.Multer.File[];
    },
  ): Promise<Teacher> {
    return this.dataSource.transaction(async (manager) => {
      const teacher = await manager.findOne(Teacher, {
        where: { id },
        relations: ['certificates'],
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }
      if (files.profile?.[0]) {
        const uploaded = await this.cloudinaryService.uploadImage(
          files.profile[0],
          'teachers',
        );
        teacher.profile = uploaded.secure_url;
      }

      if (updateTeacherDto.password) {
        teacher.password = await bcrypt.hash(updateTeacherDto.password, 10);
      }

      if (updateTeacherDto.name !== undefined)
        teacher.name = updateTeacherDto.name;
      if (updateTeacherDto.phone !== undefined)
        teacher.phone = updateTeacherDto.phone;
      if (updateTeacherDto.qualification !== undefined)
        teacher.qualification = updateTeacherDto.qualification;
      if (updateTeacherDto.experience !== undefined)
        teacher.experience = updateTeacherDto.experience;
      if (updateTeacherDto.status !== undefined)
        teacher.status = updateTeacherDto.status;

      const updatedTeacher = await manager.save(teacher);
      if (files.master_certificate?.[0] && teacher.certificates?.[0]) {
        const uploaded = await this.cloudinaryService.uploadImage(
          files.master_certificate[0],
          'certificates',
        );
        teacher.certificates[0].master_certificate = uploaded.secure_url;
        await manager.save(teacher.certificates[0]);
      }
      const userManagement = await manager.findOne(Usermanagement, {
        where: { refId: id, role: 'teacher' },
      });

      if (userManagement) {
        if (updateTeacherDto.name !== undefined)
          userManagement.name = updateTeacherDto.name;
        if (updateTeacherDto.email !== undefined)
          userManagement.email = updateTeacherDto.email;
        if (updateTeacherDto.password)
          userManagement.password = teacher.password;
        if (updateTeacherDto.status !== undefined)
          userManagement.status = updateTeacherDto.status;

        await manager.save(userManagement);
      }

      return updatedTeacher;
    });
  }
}

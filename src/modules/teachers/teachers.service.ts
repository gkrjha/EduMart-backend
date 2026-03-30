import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeacherDTO } from './dtos/teacher.dto';
import { DataSource } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { Teacher } from './entities/teacher.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Usermanagement } from '../usermanagement/entities/usermanagement.entities';
import { Specialization } from '../specializations/entities/specialization.entity';
import { Qualification } from 'src/common/enums/enum';
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
      profile?: Express.Multer.File;
      x_certificate?: Express.Multer.File;
      xii_certificate?: Express.Multer.File;
      bachlor_certificate?: Express.Multer.File;
      master_certificate?: Express.Multer.File;
      phD?: Express.Multer.File;
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

      const specializationNames = Array.isArray(teacherDto.specializationNames)
        ? teacherDto.specializationNames
        : [teacherDto.specializationNames];

      const specializations = await manager.find(Specialization, {
        where: specializationNames.map((name) => ({ name })),
      });

      if (specializations.length !== specializationNames.length) {
        throw new BadRequestException('One or more specializations not found');
      }

      // Qualification-based certificate validation (before saving)
      if (
        (teacherDto.qualification === Qualification.MASTER ||
          teacherDto.qualification === Qualification.PHD) &&
        !files.master_certificate?.[0]
      ) {
        throw new BadRequestException(
          'Master certificate is required for Master/PhD qualification',
        );
      }
      if (teacherDto.qualification === Qualification.PHD && !files.phD?.[0]) {
        throw new BadRequestException(
          'PhD certificate is required for PhD qualification',
        );
      }

      const teacherEntity = manager.create(Teacher, {
        name: teacherDto.name,
        email: teacherDto.email,
        password: hashPassword,
        gender: teacherDto.gender,
        phone: teacherDto.phone,
        qualification: teacherDto.qualification,
        experience: teacherDto.experience,
        status: teacherDto.status,
        createdBy: { id: adminId } as any,
        profile: profileUrl,
        specializations: specializations,
      });
      const savedTeacher = await manager.save(teacherEntity);

      const certificateUrls: any = {};

      for (const key of [
        'x_certificate',
        'xii_certificate',
        'bachlor_certificate',
        'master_certificate',
        'phD',
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

      return await manager.findOne(Teacher, {
        where: { id: savedTeacher.id },
        relations: ['certificates', 'specializations'],
      });
    });
  }

  async update(
    id: string,
    teacherDto: UpdateTeacherDto,
    files: {
      profile?: Express.Multer.File;
      master_certificate?: Express.Multer.File;
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

      if (files.profile) {
        const upload = await this.cloudinaryService.uploadImage(files.profile, 'teachers');
        teacher.profile = upload.secure_url;
      }

      if (files.master_certificate) {
        const upload = await this.cloudinaryService.uploadImage(files.master_certificate, 'certificates');
        teacher.certificates[0].master_certificate = upload.secure_url;
      }

      if (teacherDto.name !== undefined) teacher.name = teacherDto.name;
      if (teacherDto.phone !== undefined) teacher.phone = teacherDto.phone;
      if (teacherDto.experience !== undefined) teacher.experience = teacherDto.experience;

      const userManagement = await manager.findOne(Usermanagement, {
        where: { refId: id, role: 'teacher' },
      });
      if (userManagement) {
        if (teacherDto.name !== undefined) userManagement.name = teacherDto.name;
        await manager.save(userManagement);
      }

      return await manager.save(teacher);
    });
  }

  async findall(search?: string): Promise<Teacher[]> {
    if (search) {
      return await this.dataSource
        .getRepository(Teacher)
        .createQueryBuilder('teacher')
        .leftJoinAndSelect('teacher.certificates', 'certificate')
        .leftJoinAndSelect('teacher.specializations', 'specialization')
        .where('teacher.name ILIKE :search', { search: `%${search}%` })
        .orWhere('teacher.email ILIKE :search', { search: `%${search}%` })
        .getMany();
    }

    return await this.dataSource
      .getRepository(Teacher)
      .find({ relations: ['certificates', 'specializations'] });
  }

  async findOne(id: string): Promise<Teacher | null> {
    return await this.dataSource.getRepository(Teacher).findOne({
      where: { id },
      relations: ['certificates', 'specializations'],
    });
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(Teacher, { id });
      if (result.affected === 0) {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }
      await manager.delete(Usermanagement, { refId: id, role: 'teacher' });
    });
  }
}

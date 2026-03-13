import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Usermanagement } from '../usermanagement/entities/usermanagement.entities';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  private studentRepository: Repository<Student>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.studentRepository = this.dataSource.getRepository(Student);
  }

  async create(
    createStudentDto: CreateStudentDto,
    file?: Express.Multer.File,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const existingStudent = await manager.findOne(Student, {
        where: { email: createStudentDto.email },
      });

      if (existingStudent) {
        throw new BadRequestException('Student with this email already exists');
      }

      const hashPassword = await bcrypt.hash(createStudentDto.password, 10);
      let profileUrl: string | undefined;

      if (file) {
        const uploaded = await this.cloudinaryService.uploadImage(
          file,
          'students',
        );
        profileUrl = uploaded.secure_url;
      }

      const student = manager.create(Student, {
        name: createStudentDto.name,
        email: createStudentDto.email,
        password: hashPassword,
        phone: createStudentDto.phone,
        gender: createStudentDto.gender,
        status: createStudentDto.status,
        profile: profileUrl,
      });

      const savedStudent = await manager.save(student);

      const userManagement = manager.create(Usermanagement, {
        name: savedStudent.name,
        email: savedStudent.email,
        password: hashPassword,
        role: 'student',
        refId: savedStudent.id,
        status: savedStudent.status,
      });

      await manager.save(userManagement);

      return savedStudent;
    });
  }

  async findAll(search?: string) {
    if (search) {
      return await this.studentRepository
        .createQueryBuilder('student')
        .where('student.name ILIKE :search', { search: `%${search}%` })
        .orWhere('student.email ILIKE :search', { search: `%${search}%` })
        .getMany();
    }

    return await this.studentRepository.find();
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    file?: Express.Multer.File,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const student = await manager.findOne(Student, { where: { id } });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      if (file) {
        const uploaded = await this.cloudinaryService.uploadImage(
          file,
          'students',
        );
        student.profile = uploaded.secure_url;
      }

      if (updateStudentDto.password) {
        student.password = await bcrypt.hash(updateStudentDto.password, 10);
      }

      if (updateStudentDto.name) student.name = updateStudentDto.name;
      if (updateStudentDto.email) student.email = updateStudentDto.email;
      if (updateStudentDto.phone) student.phone = updateStudentDto.phone;
      if (updateStudentDto.gender) student.gender = updateStudentDto.gender;
      if (updateStudentDto.status) student.status = updateStudentDto.status;

      const updatedStudent = await manager.save(student);

      const userManagement = await manager.findOne(Usermanagement, {
        where: { refId: id, role: 'student' },
      });

      if (userManagement) {
        if (updateStudentDto.name) userManagement.name = updateStudentDto.name;
        if (updateStudentDto.email)
          userManagement.email = updateStudentDto.email;
        if (updateStudentDto.password)
          userManagement.password = student.password;
  

        await manager.save(userManagement);
      }

      return updatedStudent;
    });
  }

  async remove(id: string) {
    await this.dataSource.transaction(async (manager) => {
      const student = await manager.findOne(Student, { where: { id } });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      await manager.delete(Usermanagement, {
        refId: id,
        role: 'student',
      });

      await manager.delete(Student, { id });
    });

    return { message: 'Student deleted successfully' };
  }
}

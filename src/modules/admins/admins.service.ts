import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/admin.dto';
import { Admin } from './entities/admin.entities';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usermanagement } from '../usermanagement/entities/usermanagement.entities';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UpdateAdminDto } from './dto/updateadmin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, UserStatus } from 'src/common/enums/enum';

@Injectable()
export class AdminsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async create(
    createAdminDto: CreateAdminDto,
    clientId: string,
    profile?: Express.Multer.File,
  ): Promise<Admin> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hashPassword = await bcrypt.hash(createAdminDto.password, 10);
      let profileUrl: string | undefined;

      if (profile?.buffer) {
        const uploaded = await this.cloudinaryService.uploadImage(profile, 'admins');
        if ('error' in uploaded) {
          throw new BadRequestException(uploaded.error?.message || 'Profile upload failed');
        }
        profileUrl = uploaded.secure_url;
      }

      const admin = queryRunner.manager.create(Admin, {
        ...createAdminDto,
        status: UserStatus.ACTIVE,
        role: Role.ADMIN,
        createdBy: { id: clientId } as Admin,
        profile: profileUrl,
      });

      await queryRunner.manager.save(admin);

      await queryRunner.manager.save(Usermanagement, {
        name: admin.name,
        email: admin.email,
        password: hashPassword,
        refId: admin.id,
        status: admin.status,
        role: Role.ADMIN,
      });

      await queryRunner.commitTransaction();
      return admin;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updateAdminDto: UpdateAdminDto,
    profile?: Express.Multer.File,
  ): Promise<Admin> {
    let updateAdmin: Admin | undefined;
    try {
      await this.dataSource.transaction(async (manager) => {
        const admin = await manager.findOne(Admin, { where: { id } });

        if (!admin) {
          throw new BadRequestException('Admin not found');
        }

        let profileUrl = admin.profile;
        if (profile?.buffer) {
          const uploaded = await this.cloudinaryService.uploadImage(profile, 'admins');
          if ('error' in uploaded) {
            throw new BadRequestException(uploaded.error?.message || 'Profile upload failed');
          }
          profileUrl = uploaded.secure_url;
        }

        Object.assign(admin, updateAdminDto, { profile: profileUrl });
        updateAdmin = await manager.save(Admin, admin);

        await manager.update(
          Usermanagement,
          { refId: admin.id },
          { name: updateAdminDto.name ?? admin.name },
        );
      });
      return updateAdmin!;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const admin = await manager.findOne(Admin, { where: { id } });
      if (!admin) {
        throw new BadRequestException('Admin not found');
      }
      await manager.delete(Admin, { id });
      await manager.delete(Usermanagement, { refId: admin.id });
    });
  }

  async findOne(id: string): Promise<Admin | null> {
    return await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.id = :id', { id })
      .loadRelationCountAndMap('admin.subAdminCount', 'admin.subAdmins')
      .leftJoinAndSelect('admin.subAdmins', 'subAdmin')
      .loadRelationCountAndMap('admin.teacherCount', 'admin.teachers')
      .leftJoinAndSelect('admin.teachers', 'teacher')
      .getOne();
  }

  async findAll(search?: string | null, loginAdminId?: string): Promise<Admin[]> {
    const query = this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.id != :loginAdminId', { loginAdminId })
      .loadRelationCountAndMap('admin.subAdminCount', 'admin.subAdmins')
      .leftJoinAndSelect('admin.subAdmins', 'subAdmin')
      .loadRelationCountAndMap('admin.teacherCount', 'admin.teachers')
      .leftJoinAndSelect('admin.teachers', 'teacher');

    if (search) {
      query.andWhere('admin.name ILIKE :search OR admin.email ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return query.getMany();
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/admin.dto';
import { Admin } from './entities/admin.entities';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usermanagement } from '../usermanagement/entities/usermanagement.entities';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
@Injectable()
export class AdminsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createAdminDto: CreateAdminDto,
    profile?: Express.Multer.File,
  ): Promise<Admin> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hashPassword = await bcrypt.hash(createAdminDto.password, 10);
      let profileUrl: string | undefined;

      if (profile?.buffer) {
        const uploaded = await this.cloudinaryService.uploadImage(
          profile,
          'admins',
        );

        if ('error' in uploaded) {
          throw new BadRequestException(
            uploaded.error?.message || 'Profile upload failed',
          );
        }

        profileUrl = uploaded.secure_url;
      }

      // const admin = this.adminRepository.create(createAdminDto);
      const admin = queryRunner.manager.create(Admin, {
        ...createAdminDto,
        profile: profileUrl,
      });

      await queryRunner.manager.save(admin);

      // const savedAdmin = await this.adminRepository.save(admin);
      // await this.userService.create({
      //   name: data.name,
      //   email: data.email,
      //   password: hashPassword,
      //   role: data.role,
      //   refId: data.refId,
      //   status: data.status,
      // });

      await queryRunner.manager.save(Usermanagement, {
        name: admin.name,
        email: admin.email,
        password: hashPassword,
        role: admin.role,
        refId: admin.refId,
        status: admin.status,
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
}

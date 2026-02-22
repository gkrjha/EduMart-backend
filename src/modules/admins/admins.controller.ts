import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from './dto/admin.dto';
import { Admin } from './entities/admin.entities';
import { AdminsService } from './admins.service';
import { FileInterceptor } from '@nestjs/platform-express';

ApiTags('Admin-controllers');

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminService: AdminsService) {}
  @Post('create-admin')
  @ApiBody({ type: CreateAdminDto })
  @UseInterceptors(FileInterceptor('profile'))
  @ApiConsumes('multipart/form-data')
  async create(@Body() createAdminDto: CreateAdminDto,  @UploadedFile() profile?: Express.Multer.File,): Promise<Admin> {
    return this.adminService.create(createAdminDto, profile);
  }
}

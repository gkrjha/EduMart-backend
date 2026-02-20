import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from './dto/admin.dto';
import { Admin } from './entities/admin.entities';
import { AdminsService } from './admins.service';

ApiTags('Admin-controllers');
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminService: AdminsService) {}
  @Post('create-admin')
  async create(@Body() createAdminDto: CreateAdminDto): Promise<Admin> {
    return this.adminService.create(createAdminDto);
  }
}

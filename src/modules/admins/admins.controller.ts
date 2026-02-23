import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from './dto/admin.dto';
import { Admin } from './entities/admin.entities';
import { AdminsService } from './admins.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateAdminDto } from './dto/updateadmin.dto';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';

@ApiTags('Admin-controllers')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminService: AdminsService) {}
  @Post('create-admin')
  @ApiBody({ type: CreateAdminDto })
  @UseInterceptors(FileInterceptor('profile'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() profile?: Express.Multer.File,
  ): Promise<Admin> {
    return this.adminService.create(createAdminDto, profile);
  }

  @Patch('update-admin/:id')
  @ApiBody({ type: UpdateAdminDto })
  @UseInterceptors(FileInterceptor('profile'))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @UploadedFile() profile?: Express.Multer.File,
  ): Promise<Admin> {
    return this.adminService.update(id, updateAdminDto, profile);
  }

  @Delete('delete-admin/:id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.adminService.delete(id);
  }
  @Get('find-all')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Admin[]> {
    return this.adminService.findAll();
  }

  @Get('find-one/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<Admin | null> {
    return this.adminService.findOne(id);
  }
}

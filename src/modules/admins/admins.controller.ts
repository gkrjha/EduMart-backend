import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/common/decorators/get-user.decorator';
import type { AuthUser } from 'src/common/types/auth-user.type';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAdminDto } from './dto/admin.dto';
import { Admin } from './entities/admin.entities';
import { AdminsService } from './admins.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateAdminDto } from './dto/updateadmin.dto';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { MailService } from 'src/mail/mail.service';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/enums/enum';
import { ConfigService } from '@nestjs/config';

@ApiTags('Admin-controllers')
@Controller('admins')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminsController {
  constructor(
    private readonly adminService: AdminsService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  @Post('create-admin')
  @ApiBody({ type: CreateAdminDto })
  @UseInterceptors(FileInterceptor('profile'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createAdminDto: CreateAdminDto,
    @User() user: AuthUser,
    @UploadedFile() profile?: Express.Multer.File,
  ): Promise<Admin> {
    return this.adminService.create(createAdminDto, user.id, profile);
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
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('search') search?: string | null,
    @User() user?: AuthUser,
  ): Promise<Admin[]> {
    return this.adminService.findAll(search, user?.id as string);
  }

  @Get('find-one/:id')
  async findOne(@Param('id') id: string): Promise<Admin | null> {
    return this.adminService.findOne(id);
  }

  @Post('invite')
  async inviteAdmin(
    @Body() inviteAdminDto: InviteAdminDto,
    @User() user: AuthUser,
  ) {
    const { email, role } = inviteAdminDto;
    const payload = { invitedBy: user.id, email, role };
    const token = this.jwtService.sign(payload, { expiresIn: '1d' });
    const roleRoutes: Record<Role, string> = {
      [Role.ADMIN]: '/Admin-controllers/AdminsController_create',
      [Role.TEACHER]: '/TeachersController_create',
      [Role.STUDENT]: '/StudentsController_create',
    };

    const route = roleRoutes[role];
    if (!route) throw new BadRequestException(`Invalid role: ${role}`);

    const baseUrl = this.configService.get('APP_BASE_URL') || 'http://localhost:8000';
    const verificationLink = `${baseUrl}/api/v1/${route}?token=${token}`;
    try {
      await this.mailService.sendEmail({
        to: email,
        subject: 'Welcome to EduMart Portal',
        template: 'admin-signup',
        context: { name: email.split('@')[0], verificationLink },
      });
    } catch (err) {
      console.error('Error sending invite email:', err);
      throw new InternalServerErrorException('Failed to send invite email');
    }

    return { message: 'Invite email sent successfully', email, role };
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumberString, IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({
    description: 'The name of the admin',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Password',
    example: '123456',
  })
  @IsNumberString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'The phone number of the admin',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'The status of the admin',
    example: 'active',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  profile?: any;
}

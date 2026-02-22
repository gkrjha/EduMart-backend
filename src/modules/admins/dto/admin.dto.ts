import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'The name of the admin',
    example: 'John Doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The email of the admin',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password is required',
    example: 'password123',
    required: true,
  })
  @IsNumberString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The role of the admin',
    example: 'admin',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'The phone number of the admin',
    example: '1234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'The status of the admin',
    example: 'active',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ description: 'Ref id of the admin', required: true })
  @IsString()
  @IsNotEmpty()
  refId: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  profile?: any;
}

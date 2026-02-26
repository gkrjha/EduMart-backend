import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from 'src/common/enum';
import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class TeacherDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  qualification: string;

  @ApiProperty()
  experience: number;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  profile?: string;

  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  @Transform(({ value }) => value?.toLowerCase())
  status: UserStatus;

  @ApiProperty({ type: 'string', format: 'binary' })
  x_certificate: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  xii_certificate: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  bachlor_certificate: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  master_certificate?: any;
}

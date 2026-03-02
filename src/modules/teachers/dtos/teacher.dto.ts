import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Gender,
  Qualification,
  Specialization,
  UserStatus,
} from 'src/common/enums/enum';
import {
  IsEnum,
  ValidateIf,
  IsNotEmpty,
  IsArray,
  IsString,
} from 'class-validator';
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

  @ApiProperty({ enum: Qualification })
  qualification: Qualification;

  @ApiProperty()
  experience: number;

  @ApiProperty({ enum: Gender })
  gender: Gender;

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
  @ValidateIf(
    (o) =>
      o.qualification === Qualification.MASTER ||
      o.qualification === Qualification.PHD,
  )
  @IsNotEmpty({
    message: 'Master certificate is required for Master qualification',
  })
  master_certificate?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @ValidateIf((o) => o.qualification === Qualification.PHD)
  @IsNotEmpty({ message: 'PhD certificate is required for PhD qualification' })
  phD?: any;

  @ApiProperty({
    enum: Specialization,
    isArray: true,
    example: ['Computer Science', 'Data Science'],
    description: 'Array of specialization names',
  })
  @IsArray()
  @IsEnum(Specialization, { each: true })
  @Transform(
    ({ value }) => {
      if (!value) return [];
      if (typeof value === 'string') {
        if (value.trim().startsWith('[')) {
          try {
            return JSON.parse(value);
          } catch {}
        }
        if (value.includes(',')) return value.split(',').map((v) => v.trim());
        return [value];
      }
      if (Array.isArray(value)) return value;
      return [];
    },
    { toClassOnly: true },
  )
  specializationNames: string[];
}

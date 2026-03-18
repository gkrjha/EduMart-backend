import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'superadmin@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'admin123',
  })
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyRazorpayDto {
  @ApiProperty({ example: 'order_Abc123' })
  @IsNotEmpty()
  @IsString()
  razorpay_order_id: string;

  @ApiProperty({ example: 'pay_Abc123' })
  @IsNotEmpty()
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty({ example: 'signature_hash' })
  @IsNotEmpty()
  @IsString()
  razorpay_signature: string;
}

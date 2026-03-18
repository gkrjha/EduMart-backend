import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoursePurchasesService } from './course-purchases.service';
import { CreateCoursePurchaseDto } from './dto/create-course-purchase.dto';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/common/jwt/roles.guard';
import { Roles } from 'src/common/jwt/roles.decorator';
import { Role } from 'src/common/enums/enum';

@ApiTags('Course Purchases')
@Controller('course-purchases')
export class CoursePurchasesController {
  constructor(
    private readonly coursePurchasesService: CoursePurchasesService,
  ) {}

  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Stripe webhook endpoint (raw body required)' })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.coursePurchasesService.handleStripeWebhook(
      req.rawBody!,
      signature,
    );
    return { received: true };
  }

  // ─── Authenticated routes ──────────────────────────────────────────────────
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary:
      'Initiate course purchase — returns Stripe client_secret or Razorpay order',
  })
  @ApiResponse({ status: 201, description: 'Payment initiated' })
  @ApiResponse({ status: 409, description: 'Course already purchased' })
  initiate(
    @Body() dto: CreateCoursePurchaseDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coursePurchasesService.initiatePurchase(dto, req.user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('confirm/stripe')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary:
      'Manually confirm Stripe payment (use when no webhook is configured)',
  })
  confirmStripe(
    @Body('payment_intent_id') paymentIntentId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.coursePurchasesService.confirmStripePayment(
      paymentIntentId,
      req.user.id,
    );
  }

  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Verify Razorpay payment and activate purchase' })
  @ApiResponse({ status: 201, description: 'Purchase activated' })
  verifyRazorpay(
    @Body() dto: VerifyRazorpayDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coursePurchasesService.verifyRazorpay(dto, req.user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get all purchases of logged-in student' })
  findMyPurchases(@Req() req: { user: { id: string } }) {
    return this.coursePurchasesService.findAllByStudent(req.user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get purchase by ID' })
  findOne(@Param('id') id: string) {
    return this.coursePurchasesService.findOne(id);
  }
}

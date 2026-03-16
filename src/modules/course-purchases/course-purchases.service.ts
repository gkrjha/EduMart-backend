import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CoursePurchase,
  PaymentGateway,
  PurchaseStatus,
} from './entities/course-purchase.entity';
import { CreateCoursePurchaseDto } from './dto/create-course-purchase.dto';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto';
import { Course } from '../courses/entities/course.entities';
import { PaymentService } from './payment.service';

@Injectable()
export class CoursePurchasesService {
  constructor(
    @InjectRepository(CoursePurchase)
    private readonly purchaseRepo: Repository<CoursePurchase>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Initiates a course purchase.
   * - Stripe: returns { client_secret, payment_intent_id }
   * - Razorpay: returns { order_id, amount, currency, key_id }
   */
  async initiatePurchase(dto: CreateCoursePurchaseDto, studentId: string) {
    const course = await this.courseRepo.findOne({
      where: { id: dto.course_id },
    });
    if (!course)
      throw new NotFoundException(`Course ${dto.course_id} not found`);

    const existing = await this.purchaseRepo.findOne({
      where: {
        student_id: studentId,
        course_id: dto.course_id,
        status: PurchaseStatus.ACTIVE,
      },
    });
    if (existing) throw new ConflictException('Course already purchased');

    const currency = dto.currency ?? 'INR';
    const amountInPaise = Math.round(parseFloat(course.price) * 100);

    if (dto.payment_gateway === PaymentGateway.STRIPE) {
      const intent = await this.paymentService.createStripePaymentIntent(
        amountInPaise,
        currency.toLowerCase(),
        { student_id: studentId, course_id: dto.course_id },
      );

      // Save a pending record keyed by PaymentIntent id
      const purchase = this.purchaseRepo.create({
        student_id: studentId,
        course_id: dto.course_id,
        transaction_id: intent.id,
        gateway_order_id: intent.id,
        payment_gateway: PaymentGateway.STRIPE,
        amount: parseFloat(course.price),
        currency,
        status: PurchaseStatus.PENDING,
        expire_at: dto.expire_at ? new Date(dto.expire_at) : undefined,
      });
      await this.purchaseRepo.save(purchase);

      return {
        gateway: 'stripe',
        client_secret: intent.client_secret,
        payment_intent_id: intent.id,
      };
    }

    if (dto.payment_gateway === PaymentGateway.RAZORPAY) {
      const receipt = `rcpt_${studentId.slice(0, 8)}_${Date.now()}`;
      const order = await this.paymentService.createRazorpayOrder(
        amountInPaise,
        currency,
        receipt,
      );

      // Save a pending record keyed by Razorpay order id (transaction_id updated on verify)
      const purchase = this.purchaseRepo.create({
        student_id: studentId,
        course_id: dto.course_id,
        transaction_id: order.id, // will be replaced with payment_id on verify
        gateway_order_id: order.id,
        payment_gateway: PaymentGateway.RAZORPAY,
        amount: parseFloat(course.price),
        currency,
        status: PurchaseStatus.PENDING,
        expire_at: dto.expire_at ? new Date(dto.expire_at) : undefined,
      });
      await this.purchaseRepo.save(purchase);

      return {
        gateway: 'razorpay',
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    }

    throw new BadRequestException('Unsupported payment gateway');
  }

  /**
   * Verifies Razorpay payment signature and activates the purchase.
   */
  async verifyRazorpay(
    dto: VerifyRazorpayDto,
    studentId: string,
  ): Promise<CoursePurchase> {
    const isValid = this.paymentService.verifyRazorpaySignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
    if (!isValid) throw new BadRequestException('Invalid Razorpay signature');

    const purchase = await this.purchaseRepo.findOne({
      where: { gateway_order_id: dto.razorpay_order_id, student_id: studentId },
    });
    if (!purchase) throw new NotFoundException('Purchase record not found');

    purchase.transaction_id = dto.razorpay_payment_id;
    purchase.status = PurchaseStatus.ACTIVE;
    return this.purchaseRepo.save(purchase);
  }

  /**
   * Manual Stripe confirmation (no webhook needed for dev/testing).
   * Frontend calls this after payment succeeds with the payment_intent_id.
   */
  async confirmStripePayment(
    paymentIntentId: string,
    studentId: string,
  ): Promise<CoursePurchase> {
    const intent =
      await this.paymentService.retrieveStripePaymentIntent(paymentIntentId);
    if (intent.status !== 'succeeded') {
      throw new BadRequestException(
        `Payment not succeeded. Status: ${intent.status}`,
      );
    }

    const purchase = await this.purchaseRepo.findOne({
      where: { gateway_order_id: paymentIntentId, student_id: studentId },
    });
    if (!purchase) throw new NotFoundException('Purchase record not found');

    purchase.status = PurchaseStatus.ACTIVE;
    return this.purchaseRepo.save(purchase);
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    const event = this.paymentService.verifyStripeWebhook(payload, signature);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string };
      await this.purchaseRepo.update(
        { gateway_order_id: intent.id },
        { status: PurchaseStatus.ACTIVE },
      );
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as { id: string };
      await this.purchaseRepo.update(
        { gateway_order_id: intent.id },
        { status: PurchaseStatus.FAILED },
      );
    }
  }

  async findAllByStudent(studentId: string): Promise<CoursePurchase[]> {
    return this.purchaseRepo.find({
      where: { student_id: studentId },
      relations: ['course'],
    });
  }

  async findOne(id: string): Promise<CoursePurchase> {
    const purchase = await this.purchaseRepo.findOne({
      where: { id },
      relations: ['student', 'course'],
    });
    if (!purchase) throw new NotFoundException(`Purchase ${id} not found`);
    return purchase;
  }

  async updateExpiredStatuses(): Promise<void> {
    await this.purchaseRepo
      .createQueryBuilder()
      .update(CoursePurchase)
      .set({ status: PurchaseStatus.EXPIRED })
      .where('expire_at < NOW() AND status = :status', {
        status: PurchaseStatus.ACTIVE,
      })
      .execute();
  }
}

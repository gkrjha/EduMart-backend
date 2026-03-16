import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private razorpay: Razorpay;

  constructor(private config: ConfigService) {
    this.stripe = new Stripe(this.config.getOrThrow<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-02-25.clover',
    });

    this.razorpay = new Razorpay({
      key_id: this.config.getOrThrow<string>('RAZORPAY_KEY_ID'),
      key_secret: this.config.getOrThrow<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  // ─── Stripe ───────────────────────────────────────────────────────────────

  async createStripePaymentIntent(
    amountInPaise: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: amountInPaise, // in smallest unit (paise / cents)
      currency,
      metadata,
    });
  }

  verifyStripeWebhook(payload: Buffer, signature: string): Stripe.Event {
    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
  }

  async retrieveStripePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(id);
  }

  // ─── Razorpay ─────────────────────────────────────────────────────────────

  async createRazorpayOrder(
    amountInPaise: number,
    currency: string,
    receipt: string,
  ): Promise<{ id: string; amount: number; currency: string }> {
    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
    });
    return order as { id: string; amount: number; currency: string };
  }

  verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const secret = this.config.getOrThrow<string>('RAZORPAY_KEY_SECRET');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  }
}

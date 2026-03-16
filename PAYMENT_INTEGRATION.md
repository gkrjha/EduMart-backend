# Payment Integration Guide

## Stripe

### Install
```bash
npm install stripe
```

### ENV
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Flow

1. Student calls `POST /course-purchases` → backend creates a Stripe **PaymentIntent**
2. Frontend confirms payment using the returned `client_secret`
3. Stripe sends a webhook event `payment_intent.succeeded` to your endpoint
4. Backend verifies the webhook signature, then saves the purchase to DB

### Key Stripe Methods

| Action | Method |
|---|---|
| Create payment intent | `stripe.paymentIntents.create({ amount, currency })` |
| Verify webhook | `stripe.webhooks.constructEvent(payload, sig, secret)` |
| Retrieve payment | `stripe.paymentIntents.retrieve(id)` |

### Webhook Endpoint
- Route: `POST /webhooks/stripe`
- Must use `express.raw()` body parser (not JSON) for signature verification
- In NestJS, exclude this route from the global JSON body parser in `main.ts`

```ts
// main.ts
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
```

### transaction_id
Store `paymentIntent.id` (e.g. `pi_3Abc...`) as the `transaction_id` in `CoursePurchase`.

---

## Razorpay

### Install
```bash
npm install razorpay
```

### ENV
```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Flow

1. Student calls `POST /course-purchases` → backend creates a Razorpay **Order**
2. Frontend opens Razorpay checkout with the `order_id`
3. On success, frontend sends `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` to backend
4. Backend verifies the signature using HMAC-SHA256, then saves the purchase to DB

### Key Razorpay Methods

| Action | Method |
|---|---|
| Create order | `razorpay.orders.create({ amount, currency })` |
| Fetch payment | `razorpay.payments.fetch(paymentId)` |
| Verify signature | `crypto.createHmac('sha256', secret).update(orderId + '\|' + paymentId).digest('hex')` |

### Signature Verification
```ts
import * as crypto from 'crypto';

const expected = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

const isValid = expected === razorpay_signature;
```

### transaction_id
Store `razorpay_payment_id` (e.g. `pay_Abc123`) as the `transaction_id` in `CoursePurchase`.

---

## Comparison

| Feature | Stripe | Razorpay |
|---|---|---|
| Global support | Yes | India-focused |
| Webhook verification | Signature header | HMAC on order+payment |
| Test cards | `4242 4242 4242 4242` | `4111 1111 1111 1111` |
| Dashboard | dashboard.stripe.com | dashboard.razorpay.com |
| NestJS package | `stripe` | `razorpay` |

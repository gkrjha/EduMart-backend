# Course Purchase with Stripe & Razorpay — Implementation Docs

## Overview

Course purchase flow supports two payment gateways:
- **Stripe** — global payments via PaymentIntent
- **Razorpay** — India-focused payments via Orders

---

## File Structure

```
src/modules/course-purchases/
├── entities/
│   └── course-purchase.entity.ts   # DB entity with payment fields
├── dto/
│   ├── create-course-purchase.dto.ts  # Initiate purchase DTO
│   └── verify-razorpay.dto.ts         # Razorpay verification DTO
├── course-purchases.controller.ts  # API endpoints
├── course-purchases.service.ts     # Business logic
├── course-purchases.module.ts      # Module wiring
└── payment.service.ts              # Stripe & Razorpay SDK wrapper
```

---

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # optional for dev, required for production

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

---

## Entity — `CoursePurchase`

Added fields on top of the original entity:

| Field | Type | Description |
|---|---|---|
| `payment_gateway` | enum | `stripe` or `razorpay` |
| `gateway_order_id` | string | Stripe PaymentIntent ID / Razorpay Order ID |
| `amount` | decimal | Course price at time of purchase |
| `currency` | string | e.g. `INR`, `USD` |
| `status` | enum | `pending` → `active` / `failed` / `expired` |

```ts
export enum PurchaseStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export enum PaymentGateway {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
}
```

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/course-purchases` | Student JWT | Initiate purchase |
| POST | `/course-purchases/confirm/stripe` | Student JWT | Manually confirm Stripe payment |
| POST | `/course-purchases/verify/razorpay` | Student JWT | Verify Razorpay signature |
| POST | `/course-purchases/webhook/stripe` | None (raw body) | Stripe webhook |
| GET | `/course-purchases/my` | Student JWT | Get my purchases |
| GET | `/course-purchases/:id` | JWT | Get purchase by ID |

---

## Stripe Flow

### Step 1 — Initiate Purchase

```
POST /api/v1/course-purchases
Authorization: Bearer <student_token>
```

```json
{
  "course_id": "uuid-here",
  "payment_gateway": "stripe",
  "currency": "inr"
}
```

Response:
```json
{
  "gateway": "stripe",
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

A `CoursePurchase` record is saved with `status: pending`.

### Step 2 — Frontend Confirms Payment

Use Stripe.js on the frontend:
```js
const { error } = await stripe.confirmCardPayment(client_secret, {
  payment_method: { card: cardElement }
});
```

Or for testing via Stripe API directly:
```bash
curl -X POST https://api.stripe.com/v1/payment_intents/<pi_id>/confirm \
  -u "sk_test_...:" \
  -d "payment_method=pm_card_visa"
```

### Step 3a — Manual Confirm (Dev / No Webhook)

```
POST /api/v1/course-purchases/confirm/stripe
Authorization: Bearer <student_token>
```

```json
{
  "payment_intent_id": "pi_xxx"
}
```

Backend calls `stripe.paymentIntents.retrieve(id)`, checks `status === 'succeeded'`, then sets purchase to `active`.

### Step 3b — Webhook (Production)

Stripe automatically calls:
```
POST /api/v1/course-purchases/webhook/stripe
Header: stripe-signature: t=...,v1=...
```

Backend verifies signature using `STRIPE_WEBHOOK_SECRET` and handles:
- `payment_intent.succeeded` → status = `active`
- `payment_intent.payment_failed` → status = `failed`

> **main.ts** registers raw body middleware for this route so signature verification works:
> ```ts
> app.use('/api/v1/course-purchases/webhook/stripe', express.raw({ type: 'application/json' }));
> ```

---

## Razorpay Flow

### Step 1 — Initiate Purchase

```
POST /api/v1/course-purchases
Authorization: Bearer <student_token>
```

```json
{
  "course_id": "uuid-here",
  "payment_gateway": "razorpay",
  "currency": "INR"
}
```

Response:
```json
{
  "gateway": "razorpay",
  "order_id": "order_Abc123",
  "amount": 49900,
  "currency": "INR"
}
```

### Step 2 — Frontend Opens Razorpay Checkout

```js
const rzp = new Razorpay({
  key: 'rzp_test_...',
  order_id: 'order_Abc123',
  amount: 49900,
  currency: 'INR',
  handler: function(response) {
    // send response to backend verify endpoint
  }
});
rzp.open();
```

### Step 3 — Verify Signature

```
POST /api/v1/course-purchases/verify/razorpay
Authorization: Bearer <student_token>
```

```json
{
  "razorpay_order_id": "order_Abc123",
  "razorpay_payment_id": "pay_Abc123",
  "razorpay_signature": "hmac_hash"
}
```

Backend verifies:
```ts
HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET) === razorpay_signature
```

On success → `transaction_id` updated to `payment_id`, status set to `active`.

---

## PaymentService — SDK Wrapper

```
src/modules/course-purchases/payment.service.ts
```

| Method | Description |
|---|---|
| `createStripePaymentIntent(amount, currency, metadata)` | Creates Stripe PaymentIntent |
| `retrieveStripePaymentIntent(id)` | Fetches PaymentIntent status from Stripe |
| `verifyStripeWebhook(payload, signature)` | Validates webhook signature |
| `createRazorpayOrder(amount, currency, receipt)` | Creates Razorpay Order |
| `verifyRazorpaySignature(orderId, paymentId, signature)` | HMAC verification |

> Amount is always in **smallest currency unit** (paise for INR, cents for USD).
> Course price is multiplied by 100: `Math.round(parseFloat(course.price) * 100)`

---

## Test Cards

**Stripe:**
| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future expiry, any CVC.

**Razorpay:**
| Card | Result |
|---|---|
| `4111 1111 1111 1111` | Success |

---

## Purchase Status Lifecycle

```
PENDING  →  ACTIVE    (payment succeeded)
PENDING  →  FAILED    (payment failed)
ACTIVE   →  EXPIRED   (expire_at passed, via cron updateExpiredStatuses())
```

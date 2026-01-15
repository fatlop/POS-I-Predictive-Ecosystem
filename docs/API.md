# API Documentation

Complete API reference for POS-I Predictive Ecosystem.

## Base URL
```
Development: http://localhost:3000
Production: https://pos-i.vercel.app
```

## Authentication

All authenticated endpoints require a valid Supabase JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Health Check

### GET /api/health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "operational",
    "stripe": "operational",
    "gemini": "operational"
  }
}
```

---

## Stripe Payments

### POST /api/checkout
Create a Stripe checkout session for subscriptions.

**Request Body:**
```json
{
  "userId": "uuid",
  "tier": "basic|pro|enterprise",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/webhooks
Stripe webhook handler. Called automatically by Stripe.

**Events Handled:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## FATI Token System

### POST /api/fati/purchase
Create a purchase session for FATI tokens.

**Request Body:**
```json
{
  "userId": "uuid",
  "amount": 10,
  "fatiAmount": 1000,
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "purchaseOption": {
    "amount": 1000,
    "price": 10,
    "bonus": 10,
    "totalFati": 1100
  }
}
```

### POST /api/fati/transfer
Transfer FATI tokens between users.

**Request Body:**
```json
{
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "amount": 100
}
```

**Alternative (by email):**
```json
{
  "fromUserId": "uuid",
  "toEmail": "recipient@example.com",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "transfer": {
    "from": "uuid",
    "to": "uuid",
    "amount": 100,
    "fromBalance": 900,
    "toBalance": 1100
  }
}
```

**Error Responses:**
- `400` - Invalid amount or insufficient balance
- `404` - Recipient not found

---

## Referral System

### POST /api/referrals/create
Generate or retrieve referral code for a user.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "referralCode": "REF-ABC123",
  "referralUrl": "https://pos-i.app/signup?ref=REF-ABC123"
}
```

### GET /api/referrals/create?userId=uuid
Get referral info and statistics.

**Response:**
```json
{
  "referralCode": "REF-ABC123",
  "referralUrl": "https://pos-i.app/signup?ref=REF-ABC123",
  "stats": {
    "totalReferrals": 5,
    "completedReferrals": 3,
    "totalRewards": 150
  }
}
```

### POST /api/referrals/track
Track a new referral signup.

**Request Body:**
```json
{
  "referralCode": "REF-ABC123",
  "newUserId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "bonusAwarded": 100,
  "referrer": {
    "id": "uuid",
    "email": "referrer@example.com"
  }
}
```

---

## Error Codes

Standard HTTP status codes are used:

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message here"
}
```

---

## Rate Limits

- **Free tier:** 10 requests/minute
- **Basic tier:** 60 requests/minute
- **Pro tier:** 300 requests/minute
- **Enterprise tier:** Unlimited

Exceeded rate limits return `429 Too Many Requests`.

---

## Webhooks

### Stripe Webhooks

Configure in Stripe Dashboard:
```
URL: https://your-domain.com/api/webhooks
Events: checkout.session.completed, customer.subscription.*
```

Remember to set `STRIPE_WEBHOOK_SECRET` in environment variables.

---

## Testing

Use Stripe test mode with test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## Support

For API support, contact: support@pos-i.app

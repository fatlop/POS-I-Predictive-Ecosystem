# Deployment Guide

Complete guide for deploying POS-I Predictive Ecosystem to production.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema executed in Supabase
- [ ] Stripe account in production mode
- [ ] Gemini API key with billing enabled
- [ ] Domain name purchased (optional)
- [ ] SSL certificate ready (Vercel provides automatically)

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best developer experience with automatic builds, previews, and edge functions.

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
vercel --prod
```

#### Step 4: Configure Environment Variables

In Vercel Dashboard (Settings → Environment Variables):

```
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

#### Step 5: Custom Domain (Optional)
1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

### Option 2: Netlify

Alternative deployment platform with great CI/CD.

#### Step 1: Connect Repository
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository

#### Step 2: Configure Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

#### Step 3: Environment Variables
Add in Netlify Dashboard → Site settings → Environment variables

#### Step 4: Deploy
Netlify will automatically deploy on every push to main branch.

---

## 🔧 Post-Deployment Configuration

### 1. Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/webhooks`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add to environment variables as `STRIPE_WEBHOOK_SECRET`

### 2. Create Stripe Products & Prices

In Stripe Dashboard → Products:

**Basic Plan:**
- Name: "POS-I Basic"
- Price: $9.99/month
- Copy Price ID → `STRIPE_PRICE_BASIC`

**Pro Plan:**
- Name: "POS-I Pro"
- Price: $29.99/month
- Copy Price ID → `STRIPE_PRICE_PRO`

**Enterprise Plan:**
- Name: "POS-I Enterprise"
- Price: $99.99/month
- Copy Price ID → `STRIPE_PRICE_ENTERPRISE`

### 3. Setup Supabase Production Database

1. Create production project in Supabase
2. Execute `/database/schema.sql` in SQL Editor
3. Configure Row Level Security (RLS) policies
4. Enable Email Auth in Authentication settings
5. Configure email templates (optional)

### 4. Configure CORS & Security Headers

Already configured in `vercel.json`, but verify:
- CORS enabled for your domain
- Content-Security-Policy headers
- Rate limiting enabled

---

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use different keys for dev/staging/prod
- Rotate secrets regularly
- Use Vercel/Netlify secret management

### API Keys
- Enable IP restrictions on Gemini API (if available)
- Use test mode for Stripe in development
- Monitor API usage for anomalies

### Database Security
- Enable RLS on all tables
- Use service key only in server-side code
- Audit database access logs regularly

### Rate Limiting
- Implement per-user rate limits
- Use IP-based limiting for anonymous users
- Monitor for abuse patterns

---

## 📊 Monitoring & Analytics

### Error Tracking
Recommended tools:
- [Sentry](https://sentry.io) - Error monitoring
- [LogRocket](https://logrocket.com) - Session replay
- Vercel Analytics - Built-in analytics

### Application Monitoring
- Uptime monitoring: [UptimeRobot](https://uptimerobot.com)
- Performance: Vercel Analytics or Google Analytics
- API monitoring: Stripe Dashboard, Supabase Dashboard

### Setup Sentry (Optional)
```bash
npm install @sentry/react @sentry/tracing
```

Add to your app:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🐛 Troubleshooting

### Build Fails
- Check Node version (should be 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npm run type-check`

### Webhook Not Working
- Verify webhook URL is correct
- Check webhook signing secret matches
- Look for errors in Stripe Dashboard → Webhooks → Events

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies allow access
- Ensure service key is used for admin operations

### API Rate Limits
- Monitor Gemini API usage in Google Cloud Console
- Implement caching for common queries
- Consider upgrading API limits

---

## 📈 Scaling Considerations

### When to Scale

**Signs you need to scale:**
- Response times > 2 seconds
- Database queries timing out
- API rate limits being hit frequently
- >1000 concurrent users

### Scaling Strategy

1. **Database:**
   - Upgrade Supabase plan
   - Add database indexes
   - Implement read replicas

2. **API:**
   - Enable Vercel Edge Functions
   - Add Redis caching (Upstash)
   - Implement CDN for assets

3. **Gemini API:**
   - Implement response caching
   - Add request queuing
   - Consider multiple API keys

---

## 🆘 Support & Maintenance

### Regular Maintenance Tasks
- Weekly: Review error logs
- Monthly: Update dependencies
- Quarterly: Security audit
- Yearly: Infrastructure review

### Backup Strategy
- Supabase: Automatic daily backups
- Database: Manual export weekly
- Code: Version controlled in GitHub

### Rollback Plan
```bash
# Revert to previous deployment
vercel rollback
```

---

## ✅ Launch Checklist

Before going live:

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Stripe in production mode
- [ ] Webhooks configured and tested
- [ ] Database schema deployed
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Analytics tracking enabled
- [ ] Error monitoring setup
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**Last Updated:** January 2024
**Questions?** Contact DevOps team

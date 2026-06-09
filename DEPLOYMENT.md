# EuroRail - Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A Supabase project connected with database populated
2. A Stripe account with API keys
3. Vercel project linked to a Git repository

## Environment Variables Setup

Add these environment variables to your Vercel project settings:

### Supabase (Database & Auth)
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### Stripe (Payments)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_[your-publishable-key]
STRIPE_SECRET_KEY=sk_[your-secret-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]
```

## Getting Your Keys

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy `Project URL` and `anon public key`

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API Keys
3. Copy your Publishable and Secret keys
4. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

## Stripe Webhook Setup

1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter your endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the signing secret and add as `STRIPE_WEBHOOK_SECRET`

## Deployment Steps

### Option 1: Via Vercel Git Integration

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Vercel will auto-detect Next.js
6. Add all environment variables from above
7. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel
```

## Post-Deployment

1. Test the login flow
2. Create a test account with your email
3. Try booking a ticket (use test Stripe card: 4242 4242 4242 4242)
4. Verify payment appears in Stripe dashboard
5. Check payment history vault

## Troubleshooting

### "Invalid API Key" errors
- Verify environment variables are set correctly in Vercel Settings → Environment Variables
- Restart deployment after adding/updating variables

### "Database connection failed"
- Check Supabase project is running
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Ensure RLS policies are properly configured

### Stripe webhook not firing
- Verify webhook endpoint is publicly accessible
- Check webhook secret is correct
- Monitor Stripe Dashboard → Developers → Webhooks for delivery logs

### Email confirmation issues
- Supabase sends confirmation emails by default
- Check spam folder or configure email settings in Supabase
- In development, emails are printed to console

## Database Backups

Supabase automatically creates daily backups. Access them in:
- Settings → Backups

## Scaling Considerations

- **Database**: Supabase scales automatically; monitor database size
- **Functions**: Vercel serverless functions have 60s timeout for free tier
- **Storage**: Consider Vercel Blob for file storage if needed

## Support

For issues:
1. Check [Vercel Docs](https://vercel.com/docs)
2. Check [Supabase Docs](https://supabase.com/docs)
3. Check [Stripe Docs](https://stripe.com/docs)
4. Open a support ticket on respective platforms

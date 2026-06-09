# EuroRail Train Ticket Booking System - Project Overview

## What's Been Built

A complete, production-ready train ticket booking platform from Belgium to European destinations with:
- Secure user authentication (email/password via Supabase)
- Browse destinations and real-time train schedules
- Booking system with trip rules enforcement (no stops, direct routes only)
- Secure Stripe payment integration
- Payment history vault with transaction tracking
- Full Row Level Security (RLS) for data protection

## Project Structure

```
/app
  /auth                          # Authentication pages
    /login/page.tsx             # Login form
    /sign-up/page.tsx           # Signup form  
    /callback/route.ts          # OAuth callback handler
    /error/page.tsx             # Auth error handling
  /api
    /create-payment-intent/     # Stripe payment endpoint
    /webhooks/stripe/route.ts   # Stripe webhook handler
  /booking/[id]/page.tsx        # Train booking interface
  /checkout/page.tsx            # Stripe checkout
  /payments/page.tsx            # Payment history vault
  /success/page.tsx             # Order confirmation
  page.tsx                       # Dashboard (destinations)
  layout.tsx                     # Root layout
  globals.css                    # Global styles

/lib
  /supabase
    client.ts                    # Browser Supabase client
    server.ts                    # Server Supabase client
    proxy.ts                     # Session proxy handler
  middleware.ts                  # Request middleware

/components
  /ui                            # shadcn/ui components
    button.tsx
    card.tsx
    input.tsx
    label.tsx
```

## Key Features

### Authentication
- Email/password signup and login
- Automatic email confirmation
- Session management with Supabase
- Protected routes via middleware

### Destinations & Trains
- 12 European destinations seeded (Germany, France, Netherlands, Austria, etc.)
- Minimum €100 price enforced at database level
- Real-time train schedules with departure/arrival times
- Direct routes only (no stops allowed)

### Booking System
- Select train and confirm booking
- 30-minute pre-payment requirement
- Trip details display (direct route, no stops)
- Real-time seat availability

### Payment Processing
- Stripe Checkout integration
- Automatic payment intent creation
- Webhook handling for payment confirmation
- PCI compliance via Stripe

### Payment History
- View all transactions
- Filter by status (completed, pending, failed)
- Download receipts
- Transaction details (amount, date, destination)

## Database Schema

### Tables
- **destinations**: Cities, countries, and pricing
- **trains**: Schedules, routes, and availability
- **tickets**: User bookings with payment status
- **payments**: Transaction records with Stripe reference

### Security
- Row Level Security (RLS) policies
- User data isolation
- No direct database access from frontend
- Parameterized queries throughout

## Technologies Used

- **Frontend**: Next.js 16, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel

## Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## Running Locally

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Start dev server
pnpm dev

# Open http://localhost:3000
```

## Testing the App

1. **Sign up** with a test email
2. **Confirm email** (check terminal in dev mode)
3. **Browse destinations** on dashboard
4. **Select a destination** to see available trains
5. **Book a train** and proceed to checkout
6. **Test Stripe payment** with card: `4242 4242 4242 4242`
7. **View payment history** in the payments vault

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick steps:
1. Add environment variables to Vercel
2. Push to GitHub
3. Deploy via Vercel dashboard or CLI
4. Set up Stripe webhook endpoint

## What's Next

To enhance the app further:
- Add user profiles with saved payment methods
- Implement email notifications for bookings
- Add seat selection interface
- Implement cancellation/refund flow
- Add multi-language support
- Real-time train status updates
- Mobile app with React Native

## Support & Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

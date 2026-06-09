# EuroRail - Train Ticket Booking Platform

A modern train ticket booking system for booking direct trains from Belgium to major European cities with secure Stripe payments.

## Features

- **Direct Train Routes**: No stops allowed - direct routes only
- **30-Minute Pre-Payment Requirement**: Ensure passengers pay before boarding
- **Minimum €100 Ticket Price**: Professional pricing structure  
- **Secure Stripe Payments**: Accept credit card payments securely
- **Payment History Vault**: Track all transactions with detailed history
- **User Authentication**: Secure sign up and login with Supabase
- **Interactive Dashboard**: Browse destinations and book trains

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+
- Git
- Vercel Account (for deployment)
- Supabase Account
- Stripe Account

### 1. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

### 2. Get Supabase Credentials

1. Create a project on [Supabase](https://supabase.com)
2. Go to Project Settings → API Keys
3. Copy your project URL and anon key
4. The database schema is already created in this project

### 3. Configure Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy your publishable and secret keys
4. Set up a webhook endpoint:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Listen for: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
   - Copy the signing secret

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

### 6. Authenticate

- New users can sign up at `/auth/sign-up`
- Existing users can login at `/auth/login`
- Email confirmation may be required (check spam folder)

## Project Structure

```
app/
├── page.tsx              # Dashboard with destinations
├── booking/[id]/         # Train selection & booking
├── checkout/             # Stripe payment page
├── payments/             # Payment history vault
├── auth/                 # Authentication pages
└── api/
    ├── create-payment-intent/  # Stripe session creation
    └── webhooks/stripe/        # Payment confirmation
lib/
├── supabase/
│   ├── client.ts         # Client-side Supabase
│   ├── server.ts         # Server-side Supabase
│   └── proxy.ts          # Session management
```

## Features Details

### Dashboard
- View all available train destinations
- See real-time pricing (minimum €100)
- Filter by country (Germany, France, Netherlands, etc.)
- Quick stats showing total destinations and available trains

### Booking Flow
1. Select destination from dashboard
2. Choose preferred train departure time
3. Review booking summary with trip rules
4. Proceed to secure Stripe checkout

### Payment Processing
- Secure Stripe Checkout integration
- Real-time payment status updates
- Automatic ticket status confirmation
- Payment receipt generation

### Payment History
- Complete transaction record
- Filter by status (completed, pending, failed)
- View trip details for each payment
- Download receipts

### Trip Rules Enforcement
- No stops allowed (direct routes only)
- 30-minute pre-payment requirement before departure
- Minimum €100 per ticket
- One-way tickets only

## Database Schema

### Tables
- **destinations**: Cities and their prices from Belgium
- **trains**: Train schedules with seats and prices
- **tickets**: Booked tickets with payment status
- **payments**: Payment records and transaction history

All tables have Row Level Security (RLS) enabled to protect user data.

## Deployment to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy

The app is production-ready and can be deployed immediately.

## Payment Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

## Support

For issues or questions, check the Vercel docs at https://vercel.com/docs

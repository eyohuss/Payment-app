import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-15',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return new Response('Webhook Error: Invalid signature', { status: 400 })
  }

  const supabase = await createClient(await cookies())

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { ticketId, userId } = session.metadata as {
          ticketId: string
          userId: string
        }

        // Update payment status
        await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('stripe_payment_id', session.id)

        // Update ticket status
        await supabase
          .from('tickets')
          .update({ payment_status: 'completed' })
          .eq('id', ticketId)
          .eq('user_id', userId)

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const { ticketId } = session.metadata as { ticketId: string }

        // Update payment status
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_id', session.id)

        // Update ticket status
        await supabase
          .from('tickets')
          .update({ payment_status: 'failed' })
          .eq('id', ticketId)

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { ticketId } = paymentIntent.metadata as { ticketId: string }

        // Update payment status
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_id', paymentIntent.id)

        // Update ticket status
        await supabase
          .from('tickets')
          .update({ payment_status: 'failed' })
          .eq('id', ticketId)

        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

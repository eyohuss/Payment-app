import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-15',
})

export async function POST(request: Request) {
  try {
    const { ticketId, amount, userId } = await request.json()

    if (!ticketId || !amount || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      )
    }

    const supabase = await createClient(await cookies())

    // Verify the ticket belongs to the user
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', userId)
      .single()

    if (ticketError || !ticket) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), {
        status: 404,
      })
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Train Ticket: ${ticket.from_city} to ${ticket.to_city}`,
              description: `Departure: ${new Date(ticket.departure_time).toLocaleString()}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?ticketId=${ticketId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?ticketId=${ticketId}`,
      metadata: {
        ticketId,
        userId,
      },
    })

    // Create payment record in database
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: userId,
      ticket_id: ticketId,
      amount: amount / 100, // Convert back from cents
      currency: 'EUR',
      status: 'pending',
      stripe_payment_id: session.id,
      payment_method: 'stripe',
    })

    if (paymentError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ clientSecret: session.id, sessionId: session.id }),
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Payment intent error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500 }
    )
  }
}

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface Ticket {
  id: string
  from_city: string
  to_city: string
  departure_time: string
  price: number
}

export function CheckoutContent() {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('ticketId')
  const amount = searchParams.get('amount')
  const supabase = createClient()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [paymentSuccessful, setPaymentSuccessful] = useState(false)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          redirect('/auth/login')
        }
        setUser(user)

        if (!ticketId) {
          setError('No ticket selected')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .single()

        if (fetchError) throw fetchError
        setTicket(data)
      } catch (err) {
        console.error('Error fetching ticket:', err)
        setError('Failed to load ticket details')
      } finally {
        setLoading(false)
      }
    }

    fetchTicket()
  }, [ticketId, supabase])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          amount: Number(amount) * 100,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { sessionId } = await response.json()
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  if (paymentSuccessful) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="mb-4 text-4xl">✓</div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Payment Successful!
          </h1>
          <p className="mb-6 text-muted-foreground">
            Your ticket has been booked. Check your email for confirmation.
          </p>
          <Link
            href="/payments"
            className="inline-block rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90"
          >
            View My Tickets
          </Link>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground">Ticket not found</p>
      </div>
    )
  }

  const ticketPrice = Number(amount) || ticket.price

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-foreground">
            EuroRail
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="mb-8 text-3xl font-bold text-foreground">
            Complete Your Payment
          </h1>

          {error && (
            <div className="mb-6 rounded-md bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          <div className="mb-8 rounded-lg border border-border bg-muted p-6">
            <h2 className="mb-4 font-semibold text-foreground">Ticket Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span className="font-medium text-foreground">
                  {ticket.from_city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium text-foreground">{ticket.to_city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departure:</span>
                <span className="font-medium text-foreground">
                  {new Date(ticket.departure_time).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    €{ticketPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div className="rounded-md border border-border bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Payment Information</p>
              <p className="mt-1">
                You will be redirected to Stripe to complete your payment securely.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Email: {user?.email}
              </p>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Pay €${ticketPrice.toFixed(2)}`}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Your payment information is processed securely by Stripe.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}

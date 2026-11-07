'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Train {
  id: string
  from_city: string
  to_city: string
  departure_time: string
  arrival_time: string
  available_seats: number
  price: number
}

interface Destination {
  id: string
  country: string
  city: string
  price_per_ticket: number
}

export default function BookingPage() {
  const params = useParams()
  const destinationId = params.id as string
  const supabase = createClient()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [trains, setTrains] = useState<Train[]>([])
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingInProgress, setBookingInProgress] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          redirect('/auth/login')
        }
        setUser(user)

        const [destRes, trainRes] = await Promise.all([
          supabase.from('destinations').select('*').eq('id', destinationId).single(),
          supabase.from('trains').select('*').eq('id', destinationId),
        ])

        if (destRes.error) throw destRes.error
        setDestination(destRes.data)

        // Fetch trains by destination city
        const trainsRes = await supabase
          .from('trains')
          .select('*')
          .eq('to_city', destRes.data.city)
          .gt('departure_time', new Date().toISOString())
          .order('departure_time')

        if (trainsRes.data) setTrains(trainsRes.data)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load booking information')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [destinationId, supabase])

  const handleBooking = async () => {
    if (!selectedTrain || !destination) {
      setError('Please select a train')
      return
    }

    setBookingInProgress(true)

    try {
      // Create ticket record
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          train_id: selectedTrain.id,
          from_city: selectedTrain.from_city,
          to_city: selectedTrain.to_city,
          price: selectedTrain.price,
          departure_time: selectedTrain.departure_time,
          payment_status: 'pending',
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Redirect to payment with ticket ID
      window.location.href = `/checkout?ticketId=${ticket.id}&amount=${selectedTrain.price}`
    } catch (err) {
      console.error('Booking error:', err)
      setError('Failed to create booking. Please try again.')
    } finally {
      setBookingInProgress(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground">Destination not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-foreground">
            EuroRail
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Book a Train to {destination.city}
          </h1>
          <p className="mb-8 text-muted-foreground">
            {destination.country} • No stops allowed • Direct route only
          </p>

          {error && (
            <div className="mb-6 rounded-md bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {trains.length === 0 ? (
            <div className="rounded-md bg-muted p-6 text-center text-muted-foreground">
              <p>No trains available to {destination.city} at this time.</p>
            </div>
          ) : (
            <>
              <div className="mb-8 space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Select a Train
                </h2>
                {trains.map((train) => (
                  <div
                    key={train.id}
                    onClick={() => setSelectedTrain(train)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition ${
                      selectedTrain?.id === train.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex gap-4">
                        <div>
                          <p className="font-semibold text-foreground">
                            {new Date(train.departure_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">Departure</p>
                        </div>
                        <div className="flex items-center">
                          <div className="h-1 w-12 bg-primary"></div>
                          <span className="mx-2 text-muted-foreground">→</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {new Date(train.arrival_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">Arrival</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          €{train.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {train.available_seats} seats left
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-muted p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Booking Summary
                </h2>
                {selectedTrain ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-medium text-foreground">
                        {selectedTrain.from_city} → {selectedTrain.to_city}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departure:</span>
                      <span className="font-medium text-foreground">
                        {new Date(selectedTrain.departure_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="font-semibold text-foreground">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        €{selectedTrain.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-6 space-y-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                      <p className="font-semibold">Trip Rules:</p>
                      <ul className="list-inside list-disc space-y-1">
                        <li>This is a direct route with no stops</li>
                        <li>Payment must be completed 30 minutes before departure</li>
                        <li>Minimum ticket price: €100</li>
                      </ul>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={bookingInProgress}
                      className="mt-6 w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                    >
                      {bookingInProgress ? 'Processing...' : 'Continue to Payment'}
                    </button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Select a train above to see booking summary
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface Destination {
  id: string
  country: string
  city: string
  price_per_ticket: number
  distance_km: number
}

interface Train {
  id: string
  to_city: string
  departure_time: string
  arrival_time: string
  available_seats: number
  price: number
}

export default function Dashboard() {
  const supabase = createClient()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [trains, setTrains] = useState<Train[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        redirect('/auth/login')
      }
      setUser(user)
    }

    const fetchData = async () => {
      try {
        const [destRes, trainRes] = await Promise.all([
          supabase.from('destinations').select('*').order('country'),
          supabase.from('trains').select('*').order('departure_time'),
        ])

        if (destRes.data) setDestinations(destRes.data)
        if (trainRes.data) setTrains(trainRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    fetchData()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Group destinations by country
  const groupedDestinations = destinations.reduce(
    (acc, dest) => {
      if (!acc[dest.country]) acc[dest.country] = []
      acc[dest.country].push(dest)
      return acc
    },
    {} as Record<string, Destination[]>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">EuroRail</h1>
            <p className="text-sm text-muted-foreground">
              Direct train tickets from Belgium to Europe
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-foreground">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Featured Destinations */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Popular Destinations
          </h2>

          {Object.entries(groupedDestinations).map(([country, dests]) => (
            <div key={country} className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {country}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dests.map((destination) => {
                  const availableTrains = trains.filter(
                    (t) => t.to_city === destination.city
                  ).length

                  return (
                    <div
                      key={destination.id}
                      className="rounded-lg border border-border bg-card p-6 transition hover:shadow-lg"
                    >
                      <h4 className="mb-2 text-xl font-semibold text-foreground">
                        {destination.city}
                      </h4>
                      <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                        <p>
                          Distance:{' '}
                          <span className="text-foreground">
                            {destination.distance_km} km
                          </span>
                        </p>
                        <p>
                          Starting from:{' '}
                          <span className="font-semibold text-foreground">
                            €{destination.price_per_ticket.toFixed(2)}
                          </span>
                        </p>
                        <p>
                          Trains:{' '}
                          <span className="text-foreground">
                            {availableTrains} available
                          </span>
                        </p>
                      </div>
                      <Link
                        href={`/booking/${destination.id}`}
                        className="inline-block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90"
                      >
                        Book Now
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Destinations</p>
            <p className="text-3xl font-bold text-foreground">
              {destinations.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Available Trains</p>
            <p className="text-3xl font-bold text-foreground">{trains.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Payment History</p>
            <Link
              href="/payments"
              className="text-primary hover:underline"
            >
              View All
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

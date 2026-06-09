'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, MapPin, Clock, Euro, Train } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Destination {
  id: string
  country: string
  city: string
  price_per_ticket: number
  distance_km: number
}

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)
        fetchDestinations()
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router, supabase])

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase.from('destinations').select('*').order('country')

      if (error) throw error
      setDestinations(data || [])
    } catch (err) {
      console.error('Error fetching destinations:', err)
    } finally {
      setLoading(false)
    }
  }

  const groupedDestinations = destinations.reduce(
    (acc, dest) => {
      if (!acc[dest.country]) acc[dest.country] = []
      acc[dest.country].push(dest)
      return acc
    },
    {} as Record<string, Destination[]>
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Premium Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Train className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-light tracking-wide">EuroRail</h1>
              <p className="text-xs text-muted-foreground">Premium European Routes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/payments" className="text-sm text-muted-foreground hover:text-foreground transition">
              My Tickets
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border/50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h2 className="text-5xl font-light tracking-tight mb-2">Discover Europe by Rail</h2>
            <p className="text-lg text-muted-foreground font-light">
              Direct routes from Brussels to major European destinations. No stops, guaranteed comfort, premium service.
            </p>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full mx-auto" />
            </div>
            <p className="text-muted-foreground">Loading destinations...</p>
          </div>
        </div>
      ) : (
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            {Object.entries(groupedDestinations).map(([country, dests]) => (
              <div key={country} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-2xl font-light tracking-tight">{country}</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dests.map((destination) => (
                    <Link
                      key={destination.id}
                      href={`/booking/${destination.id}`}
                      className="group"
                    >
                      <Card className="h-full bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 p-6 cursor-pointer">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h4 className="text-xl font-light mb-2 group-hover:text-primary transition">
                              {destination.city}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              From Brussels • {destination.distance_km || 'N/A'} km
                            </p>
                          </div>

                          <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Euro className="w-4 h-4 text-primary" />
                                <span className="text-2xl font-light text-primary">
                                  €{destination.price_per_ticket}
                                </span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition" />
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>Direct • No Stops</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="border-t border-border/50 py-12 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground text-sm mb-4">Premium European train experiences</p>
          <p className="text-xs text-muted-foreground/70">
            Book now. Travel within 30 minutes. Enjoy seamless, direct journeys across Europe.
          </p>
        </div>
      </section>
    </main>
  )
}

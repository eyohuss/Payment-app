'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Payment {
  id: string
  ticket_id: string
  amount: number
  status: string
  created_at: string
  stripe_payment_id: string | null
}

interface Ticket {
  id: string
  from_city: string
  to_city: string
  departure_time: string
  payment_status: string
}

export default function PaymentsPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [tickets, setTickets] = useState<Record<string, Ticket>>({})
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>(
    'all'
  )

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

        // Fetch payments
        const paymentsRes = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (paymentsRes.data) {
          setPayments(paymentsRes.data)

          // Fetch all associated tickets
          const ticketIds = paymentsRes.data.map((p) => p.ticket_id)
          if (ticketIds.length > 0) {
            const ticketsRes = await supabase
              .from('tickets')
              .select('*')
              .in('id', ticketIds)

            if (ticketsRes.data) {
              const ticketsMap = ticketsRes.data.reduce(
                (acc, t) => {
                  acc[t.id] = t
                  return acc
                },
                {} as Record<string, Ticket>
              )
              setTickets(ticketsMap)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true
    return p.status === filter
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-900',
      pending: 'bg-yellow-100 text-yellow-900',
      failed: 'bg-red-100 text-red-900',
    }
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-900'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" className="text-2xl font-bold text-foreground">
              EuroRail
            </Link>
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
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-foreground">Payment History</h1>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          {(['all', 'completed', 'pending', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No {filter !== 'all' ? filter : ''} payments found.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Book a ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Departure
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const ticket = tickets[payment.ticket_id]
                  if (!ticket) return null

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="px-4 py-4 text-sm text-foreground">
                        {ticket.from_city} → {ticket.to_city}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {new Date(ticket.departure_time).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-foreground">
                        €{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            payment.status
                          )}`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-sm text-primary hover:underline">
                          Receipt
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Card */}
        {filteredPayments.length > 0 && (
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-foreground">Summary</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold text-foreground">
                  €
                  {filteredPayments
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredPayments.filter((p) => p.status === 'completed').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredPayments.filter((p) => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

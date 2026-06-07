'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('ticketId')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate processing
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Payment Successful!
        </h1>

        <p className="mb-6 text-muted-foreground">
          Your train ticket has been booked and confirmed. A confirmation email
          has been sent to your inbox.
        </p>

        <div className="mb-8 space-y-2 rounded-md bg-blue-50 p-4 text-left text-sm text-blue-900">
          <p className="font-semibold">Important Reminders:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>This is a direct route with no stops</li>
            <li>Payment completed 30+ minutes before departure</li>
            <li>Check your email for your e-ticket</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/payments"
            className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90"
          >
            View My Tickets
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-border bg-card px-6 py-2 font-medium text-foreground hover:bg-muted"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

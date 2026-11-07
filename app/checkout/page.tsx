'use client'

import { Suspense } from 'react'
import { CheckoutContent } from './checkout-content'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><p className="text-foreground">Loading...</p></div>}>
      <CheckoutContent />
    </Suspense>
  )
}

'use client'

import { Suspense } from 'react'
import { SuccessContent } from './success-content'

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><p className="text-foreground">Loading...</p></div>}>
      <SuccessContent />
    </Suspense>
  )
}

import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    // Return a no-op proxy during SSR/build time
    return {
      auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => ({}) },
      from: () => ({ select: () => ({}) }),
    } as any
  }

  if (cachedClient) {
    return cachedClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  cachedClient = createBrowserClient(url, key)
  return cachedClient
}

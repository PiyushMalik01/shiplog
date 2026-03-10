import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate URL format; use safe fallbacks at build/SSR time so the build doesn't throw.
  // The actual Supabase calls in useEffect only run in the browser with real env vars.
  const safeUrl = url?.startsWith('https://') ? url : 'https://placeholder.supabase.co'
  const safeKey = key && key.length > 20 ? key : 'placeholder-anon-key-for-build'

  return createBrowserClient(safeUrl, safeKey)
}

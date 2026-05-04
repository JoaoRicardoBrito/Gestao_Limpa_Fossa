import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in your values.'
  )
}

if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('VITE_SUPABASE_URL must be a valid Supabase project URL (https://*.supabase.co).')
}

// Decode the JWT payload to detect accidental service_role key usage.
// The anon key has role:"anon"; service_role key has role:"service_role".
try {
  const payload = JSON.parse(atob(supabaseAnonKey.split('.')[1]))
  if (payload?.role === 'service_role') {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY contains a service_role key. ' +
      'Use only the anon/public key in the frontend — service_role bypasses RLS.'
    )
  }
} catch (e) {
  if (e instanceof Error && e.message.includes('service_role')) throw e
  // Non-standard token format — skip check and proceed
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

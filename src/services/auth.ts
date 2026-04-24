import { supabase } from '@/lib/supabase'

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignInResult {
  error: string | null
}

export async function signIn({ email, password }: SignInCredentials): Promise<SignInResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // Map Supabase error codes to user-friendly Portuguese messages (per UI-SPEC copywriting contract)
    // T-03-03: Single error message prevents user enumeration (email not found vs wrong password)
    if (
      error.message.toLowerCase().includes('invalid login credentials') ||
      error.message.toLowerCase().includes('invalid email or password')
    ) {
      return { error: 'E-mail ou senha incorretos.' }
    }
    return { error: 'Erro ao conectar. Tente novamente.' }
  }
  return { error: null }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

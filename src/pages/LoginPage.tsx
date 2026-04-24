import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

// Zod validation schema (per UI-SPEC Form Validation section)
const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha obrigatória.'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { session, loading: authLoading, signIn } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // D-15: If already logged in, redirect immediately — no flash of login UI
  useEffect(() => {
    if (!authLoading && session) {
      navigate('/agendamentos', { replace: true })
    }
  }, [authLoading, session, navigate])

  // While resolving initial session state, show nothing to avoid flickering the form
  if (authLoading) {
    return null
  }

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    const result = await signIn({ email: data.email, password: data.password })
    if (result.error) {
      setAuthError(result.error)
      return
    }
    // Success: navigate to /agendamentos, replace history (no back-nav to /login)
    navigate('/agendamentos', { replace: true })
  }

  return (
    // Full viewport centering on zinc-50 background (UI-SPEC layout contract)
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-[400px] shadow-md border-zinc-200">
        {/* App name header — Display 24px 600, centered */}
        <CardHeader className="pb-0 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Santa Clara ECO
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Admin</p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-4">
              {/* Email field */}
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-zinc-900"
                >
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit button — zinc-900 bg, white text, loading state (D-14) */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-zinc-900 hover:bg-zinc-700 text-white font-semibold mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              {/* Auth error — inline below button, no toast (D-13) */}
              {authError && (
                <p className="text-sm text-red-500 text-center" role="alert">
                  {authError}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

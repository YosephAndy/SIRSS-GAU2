'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginSchema, type LoginSchema } from '@/features/auth/schemas/auth-schemas'

import Link from 'next/link'
import { Mail, Lock, Loader2, AlertTriangle } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDriver = searchParams.get('role') === 'driver'
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginSchema) {
    try {
      setError(null)
      setIsLoading(true)

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (!result?.ok) {
        if (result?.error === 'CredentialsSignin') {
          setError('Correo o contraseña incorrectos')
        } else {
          setError(result?.error || 'Error al iniciar sesión')
        }
        return
      }

      // Fetch session dynamically to obtain user role for redirection
      const session = await getSession()
      const role = session?.user?.role?.toUpperCase()

      router.push('/dashboard')

    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex gap-2 items-center">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-bold text-slate-700 text-sm">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="tu@email.com"
              className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-[#f8fafc]/80 border-none focus:ring-2 text-slate-700 outline-none transition-all font-medium ${
                errors.email ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-[#7dd3fc]'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-bold text-slate-700 text-sm">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              {...register('password')}
              id="password"
              type="password"
              placeholder="••••••••"
              className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-[#f8fafc]/80 border-none focus:ring-2 text-slate-700 outline-none transition-all font-medium ${
                errors.password ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-[#7dd3fc]'
              }`}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="font-medium text-[#2563eb] hover:text-[#1d4ed8]">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#86efac] to-[#34d399] text-emerald-950 font-bold rounded-2xl shadow-lg shadow-[#86efac]/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-center text-sm">
        <div>
          <span className="text-slate-600">¿No tienes cuenta? </span>
          <Link href={isDriver ? "/register?role=driver" : "/register"} replace className="font-bold text-[#2563eb] hover:text-[#1d4ed8]">
            Regístrate aquí
          </Link>
        </div>
        {!isDriver && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-slate-600">¿Eres personal operativo? </span>
            <Link href="/login?role=driver" replace className="font-bold text-emerald-600 hover:text-emerald-700">
              Ingresar como Conductor
            </Link>
          </div>
        )}
        {isDriver && (
          <div className="pt-3 border-t border-slate-100">
            <Link href="/login" replace className="font-bold text-slate-600 hover:text-slate-800">
              Volver al inicio normal
            </Link>
          </div>
        )}
      </div>
    </form>
  )
}

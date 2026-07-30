'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerSchema, type RegisterSchema } from '@/features/auth/schemas/auth-schemas'

import Link from 'next/link'
import { Mail, Lock, User, Loader2, AlertTriangle } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDriver = searchParams.get('role') === 'driver'
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterSchema) {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          roleName: isDriver ? 'DRIVER' : 'CITIZEN'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      router.push('/login?registered=true')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al registrarse'
      )
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
          <label htmlFor="name" className="font-bold text-slate-700 text-sm">
            Nombre (Opcional)
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder="Tu nombre"
              className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-[#f8fafc]/80 border-none focus:ring-2 text-slate-700 outline-none transition-all font-medium ${
                errors.name ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-[#7dd3fc]'
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              {errors.name.message}
            </p>
          )}
        </div>

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
              placeholder="Mín 6 caracteres"
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

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="font-bold text-slate-700 text-sm">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              placeholder="Confirma tu contraseña"
              className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-[#f8fafc]/80 border-none focus:ring-2 text-slate-700 outline-none transition-all font-medium ${
                errors.confirmPassword ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-[#7dd3fc]'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
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
              Registrando...
            </>
          ) : (
            'Registrarse'
          )}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-center text-sm">
        <div>
          <span className="text-slate-600">¿Ya tienes cuenta? </span>
          <Link href={isDriver ? "/login?role=driver" : "/login"} replace className="font-bold text-[#2563eb] hover:text-[#1d4ed8]">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </form>
  )
}

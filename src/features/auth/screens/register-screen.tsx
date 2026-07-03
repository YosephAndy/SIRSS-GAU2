'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { RegisterForm } from '@/features/auth/components/register-form'

export function RegisterScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8fafc]">
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/Plaza.jpg"
          alt="Fondo de Plaza de Cusco"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#3b82f6]/20 via-transparent to-[#86efac]/20 mix-blend-multiply -z-10"></div>
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm -z-10"></div>

      <div className="max-w-md w-full mx-4 py-12">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-tr from-[#86efac] to-[#7dd3fc] p-2 rounded-xl text-white">
              <Leaf size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">CleanCity</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Únete a la gestión inteligente de residuos
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-2xl shadow-black/5">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

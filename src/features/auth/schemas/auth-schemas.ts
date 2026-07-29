import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Contraseña requerida')
    .min(6, 'Mínimo 6 caracteres'),
})

export const baseRegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre mínimo 2 caracteres')
    .optional(),
  email: z
    .string()
    .min(1, 'Email requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[0-9]/, 'Debe contener número'),
  roleName: z.string().optional(),
})

export const registerSchema = baseRegisterSchema.extend({
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>

export const dynamic = 'force-dynamic'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authService } from '@/features/auth/services/auth.service'
import { loginSchema } from '@/features/auth/schemas/auth-schemas'

import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: string
    }
  }

  interface User {
    id: string
    email: string
    role: string
  }
}

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validar con Zod
          const { email, password } = await loginSchema.parseAsync(
            credentials
          )

          // Validar credenciales
          const user = await authService.validateCredentials(
            email,
            password
          )

          return {
            id: user.id,
            email: user.email,
            role: (user.role as any).name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
}

export const authOptions = options

const handler = NextAuth(options)

export { handler as GET, handler as POST }
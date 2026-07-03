import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Get the current server session using the project's NextAuth options.
 */
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions)
}

/**
 * Require an active session or throw an error (use in Server Actions / API handlers).
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

/**
 * Check whether the session belongs to an admin user.
 */
export function isAdmin(session?: Session | null): boolean {
  return !!session && !!(session.user as any)?.role && (session.user as any).role === 'ADMIN'
}

export type { Session }

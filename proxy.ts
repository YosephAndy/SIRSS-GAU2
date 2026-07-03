import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Proxy (formerly middleware) to protect dashboard routes.
 * - Redirects unauthenticated users to `/login` with a callbackUrl.
 * - Prevents users with role `CITIZEN` from accessing `/dashboard` subroutes.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only run on /dashboard and its subpaths
  if (!pathname.startsWith('/dashboard')) return NextResponse.next()

  // Try to get next-auth token (works in edge proxy)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // If no session/token, redirect to login with callbackUrl
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = (token as Record<string, unknown>).role as string | undefined

  // Block citizens from accessing dashboard admin areas
  if (role === 'CITIZEN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}

import type { Metadata } from 'next'
import { Providers } from '@/providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'SIRSS - Sistema de Gestión',
  description: 'Aplicación Next.js con autenticación y base de datos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
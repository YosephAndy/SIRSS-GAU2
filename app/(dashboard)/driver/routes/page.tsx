import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DriverRouteClient } from '@/features/drivers/components/driver-route-client'

export const metadata = {
  title: 'Mi Ruta de Hoy | SIRSS-GAU'
}

export default async function DriverRoutesPage() {
  const session = await getSession()
  
  if (!session || !session.user) {
    redirect('/login')
  }

  // Verificar si es chofer
  if (session.user.role !== 'DRIVER' && session.user.role !== 'ADMIN') {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200">
          No tienes permisos para ver esta página. Debes ser un conductor.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Jornada Activa</h1>
        <p className="text-gray-500 mt-1">
          Gestiona el estado de tu ruta de recolección asignada para hoy.
        </p>
      </div>

      <DriverRouteClient driverId={session.user.id} />
    </div>
  )
}

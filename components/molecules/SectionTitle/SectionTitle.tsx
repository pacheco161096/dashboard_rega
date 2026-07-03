'use client'
import { usePathname } from 'next/navigation'

const sectionNames: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/dashboard/customers': 'Clientes',
  '/dashboard/cobranza': 'Cobranza',
  '/dashboard/reportes': 'Reportes',
  '/dashboard/usuarios': 'Usuarios',
}

export function SectionTitle() {
  const pathname = usePathname()
  const sectionName = sectionNames[pathname] || 'Dashboard'

  return (
    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
      {sectionName}
    </h1>
  )
}


"use client"

import { FC, memo } from "react"
import { CreditCardIcon, PencilIcon, TrashIcon } from "@primer/octicons-react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { User } from "@/app/dashboard/customers/page"
import { getUserPermissions } from "@/lib/roles"
import { ServiceStatusBadge } from "@/components/molecules/ServiceStatusBadge/ServiceStatusBadge"

interface TableProps {
  data: User[] | undefined
  handleUpdateCliente: (user: User[]) => void
  handleRegisterPay: (user: User[]) => void
  handleCreateTicket: (user: User[]) => void
  handleDeleteCliente?: (user: User[]) => void
}

function ActionButtons({
  user,
  permissions,
  handleRegisterPay,
  handleCreateTicket,
  handleUpdateCliente,
  handleDeleteCliente,
  size = "desktop",
}: {
  user: User
  permissions: ReturnType<typeof getUserPermissions>
  handleRegisterPay: (user: User[]) => void
  handleCreateTicket: (user: User[]) => void
  handleUpdateCliente: (user: User[]) => void
  handleDeleteCliente?: (user: User[]) => void
  size?: "desktop" | "mobile"
}) {
  const iconBtn =
    size === "desktop"
      ? "h-9 w-9"
      : "h-10 w-10"
  const iconSize = size === "desktop" ? 16 : 18

  return (
    <div className="flex items-center justify-center gap-2">
      {permissions?.canAccessCobranza && (
        <Button
          variant="outline"
          size="icon"
          className={`${iconBtn} bg-blue-600 text-white hover:bg-blue-700 border-blue-600 transition-colors`}
          onClick={() => handleRegisterPay([user])}
          title="Registrar pago"
        >
          <CreditCardIcon size={iconSize} />
        </Button>
      )}
      {permissions?.canCreateReport && (
        <Button
          variant="outline"
          size="icon"
          className={`${iconBtn} bg-green-600 text-white hover:bg-green-700 border-green-600 transition-colors`}
          onClick={() => handleCreateTicket([user])}
          title="Crear reporte"
        >
          <FileText size={iconSize} />
        </Button>
      )}
      {permissions?.canEditClient && (
        <Button
          variant="outline"
          size="icon"
          className={`${iconBtn} bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500 transition-colors`}
          onClick={() => handleUpdateCliente([user])}
          title="Editar cliente"
        >
          <PencilIcon size={iconSize} />
        </Button>
      )}
      {permissions?.canDeleteClient && handleDeleteCliente && (
        <Button
          variant="outline"
          size="icon"
          className={`${iconBtn} bg-red-600 text-white hover:bg-red-700 border-red-600 transition-colors`}
          onClick={() => handleDeleteCliente([user])}
          title="Eliminar cliente"
        >
          <TrashIcon size={iconSize} />
        </Button>
      )}
    </div>
  )
}

export const Table: FC<TableProps> = memo(function CustomersTable({
  data,
  handleUpdateCliente,
  handleRegisterPay,
  handleCreateTicket,
  handleDeleteCliente,
}) {
  const permissions = getUserPermissions()

  return (
    <>
      {/* Desktop Table - Solo visible desde 1024px (lg) */}
      <div className="hidden lg:block overflow-x-auto">
        <ShadTable>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">NO. CONTRATO</TableHead>
              <TableHead className="font-semibold text-gray-700">NOMBRE</TableHead>
              <TableHead className="font-semibold text-gray-700">CORREO</TableHead>
              <TableHead className="font-semibold text-gray-700">TELÉFONO</TableHead>
              <TableHead className="font-semibold text-gray-700">LOCALIDAD</TableHead>
              <TableHead className="font-semibold text-gray-700">TIPO DE SERVICIO</TableHead>
              <TableHead className="font-semibold text-gray-700">STATUS</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((user) => (
              <TableRow key={user.id} className="border-b hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell className="font-medium text-gray-900">{user.nombre || "N/A"}</TableCell>
                <TableCell className="text-gray-600">{user.email || "N/A"}</TableCell>
                <TableCell className="text-gray-600">{user.celular || "N/A"}</TableCell>
                <TableCell className="text-gray-600">{user.localidad || "N/A"}</TableCell>
                <TableCell className="text-gray-600">{user.tipo_servicio_paquete || "N/A"}</TableCell>
                <TableCell>
                  <ServiceStatusBadge customer={user} />
                </TableCell>
                <TableCell>
                  <ActionButtons
                    user={user}
                    permissions={permissions}
                    handleRegisterPay={handleRegisterPay}
                    handleCreateTicket={handleCreateTicket}
                    handleUpdateCliente={handleUpdateCliente}
                    handleDeleteCliente={handleDeleteCliente}
                    size="desktop"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ShadTable>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="md:hidden space-y-4">
        {data?.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">CONTRATO</span>
                  <span className="font-semibold text-gray-900">#{user.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.nombre || "N/A"}</h3>
                {user.tipo_servicio_paquete && (
                  <p className="text-sm text-gray-600 truncate">
                    <span className="font-medium">Servicio: </span>
                    {user.tipo_servicio_paquete}
                  </p>
                )}
              </div>
              <ServiceStatusBadge customer={user} className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <ActionButtons
                user={user}
                permissions={permissions}
                handleRegisterPay={handleRegisterPay}
                handleCreateTicket={handleCreateTicket}
                handleUpdateCliente={handleUpdateCliente}
                handleDeleteCliente={handleDeleteCliente}
                size="mobile"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tablet Cards (768px - 1023px) */}
      <div className="hidden md:block lg:hidden space-y-4">
        {data?.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">CONTRATO</span>
                  <span className="font-semibold text-gray-900">#{user.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{user.nombre || "N/A"}</h3>
                <div className="space-y-1">
                  {user.tipo_servicio_paquete && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Servicio: </span>
                      {user.tipo_servicio_paquete}
                    </p>
                  )}
                  {user.localidad && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Localidad: </span>
                      {user.localidad}
                    </p>
                  )}
                </div>
              </div>
              <ServiceStatusBadge customer={user} className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <ActionButtons
                user={user}
                permissions={permissions}
                handleRegisterPay={handleRegisterPay}
                handleCreateTicket={handleCreateTicket}
                handleUpdateCliente={handleUpdateCliente}
                handleDeleteCliente={handleDeleteCliente}
                size="mobile"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
})

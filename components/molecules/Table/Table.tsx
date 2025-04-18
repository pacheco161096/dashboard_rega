"use client"

import { FC } from "react"
import { CreditCardIcon, PencilIcon } from "@primer/octicons-react"
import { Badge } from "@/components/ui/badge"
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

interface TableProps {
  data: User[] | undefined
  handleUpdateCliente: (user: User[]) => void
  handleRegisterPay: (user: User[]) => void
}

export const Table: FC<TableProps> = ({ data, handleUpdateCliente, handleRegisterPay }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <ShadTable>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">NO. CONTRATO</TableHead>
            <TableHead className="font-semibold">NOMBRE</TableHead>
            <TableHead className="font-semibold">CORREO</TableHead>
            <TableHead className="font-semibold">TELÉFONO</TableHead>
            <TableHead className="font-semibold">LOCALIDAD</TableHead>
            <TableHead className="font-semibold">TIPO DE SERVICIO</TableHead>
            <TableHead className="font-semibold">STATUS</TableHead>
            <TableHead className="font-semibold">PAGAR</TableHead>
            <TableHead className="font-semibold">EDITAR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((user, i) => (
            <TableRow key={ i } className="border-b">
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.celular}</TableCell>
              <TableCell>{user.localidad}</TableCell>
              <TableCell>{user.tipo_servicio_paquete}</TableCell>
              <TableCell>
                <Badge
                  variant={user.estatus_servicio ? "outline" : "destructive"}
                  className={
                    user.estatus_servicio
                      ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                      : "bg-red-700 text-white hover:bg-red-800"
                  }
                >
                  {user.estatus_servicio ? "Activo" : "Suspendido"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-blue-700 text-white hover:bg-blue-800"
                  onClick={() => handleRegisterPay([user])}
                >
                  <CreditCardIcon size={16} />
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-yellow-500 text-white hover:bg-yellow-600"
                  onClick={() => handleUpdateCliente([user])}
                >
                  <PencilIcon size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ShadTable>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Calendar, User, FileText, Clock, Loader2, Save, MapPin, Phone, ArrowRightLeft, X } from "lucide-react"
import { ticketService } from "@/lib/ticketService"
import { TicketListResponse, TicketRequest, TicketActualizacion, TicketItem } from "@/types/ticket"
import { getUserPermissions } from "@/lib/roles"
import { UsuariosService } from "@/lib/services/usuariosService"
import { customersService } from "@/lib/services/customersService"

/** Simular reasignación localmente hasta que la API exponga el campo `reasignado` */
const SIMULAR_REASIGNACION = true
const REASSIGNED_STORAGE_KEY = "ticket_reassigned_ids"
const TECHNICIAN_OVERRIDE_KEY = "ticket_technician_overrides"

type TicketStatusFilter = "todos" | "en_proceso" | "finalizados"

interface Tecnico {
  id: string
  nombre: string
}

interface ClienteInfo {
  nombre: string
  apellido: string
  direccion: string
  telefono: string
  email: string
}

interface Ticket {
  id: string
  idReal: number
  fecha: string
  id_cliente: string
  estatus: string
  id_tecnico: string
  descripcion: string
  fechaCreacion: string
  ultimaActualizacion: string
  actualizaciones: TicketActualizacion[]
  clienteInfo?: ClienteInfo
  nombreTecnico?: string
  reasignado: boolean
}

interface TicketTrackerProps {
  onStatusUpdate?: () => void
}

function getReassignButtonIcon(isReassigning: boolean, hasTecnicoChange: boolean): ReactNode {
  if (isReassigning && hasTecnicoChange) {
    return <Save className="h-4 w-4 mr-1" />
  }
  if (isReassigning) {
    return <X className="h-4 w-4 mr-1" />
  }
  return <ArrowRightLeft className="h-4 w-4 mr-1" />
}

function getReassignedIds(): Set<number> {
  if (typeof window === "undefined") return new Set()
  try {
    const stored = localStorage.getItem(REASSIGNED_STORAGE_KEY)
    return stored ? new Set(JSON.parse(stored) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

function markTicketReassigned(idReal: number) {
  const ids = getReassignedIds()
  ids.add(idReal)
  localStorage.setItem(REASSIGNED_STORAGE_KEY, JSON.stringify([...ids]))
}

function getTechnicianOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(TECHNICIAN_OVERRIDE_KEY)
    return stored ? (JSON.parse(stored) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function saveTechnicianOverride(idReal: number, idTecnico: string) {
  const overrides = getTechnicianOverrides()
  overrides[idReal.toString()] = idTecnico
  localStorage.setItem(TECHNICIAN_OVERRIDE_KEY, JSON.stringify(overrides))
}

function resolveTecnicoNombre(idTecnico: string, tecnicos: Tecnico[]): string {
  if (!idTecnico) return "No asignado"
  const tecnico = tecnicos.find((t) => t.id === idTecnico)
  return tecnico?.nombre ?? `Técnico #${idTecnico}`
}

async function fetchClientesMap(clientIds: string[]): Promise<Map<string, ClienteInfo>> {
  const clientesMap = new Map<string, ClienteInfo>()
  if (clientIds.length === 0) return clientesMap

  try {
    const clientes = await customersService.fetchCustomersByIds(clientIds)
    clientes.forEach((cliente) => {
      const direccion =
        `${cliente.calle || ""} ${cliente.num_exterior || ""} ${cliente.num_interior || ""}, ${cliente.colonia || ""}, ${cliente.ciudad || ""}`.trim()
      clientesMap.set(cliente.id.toString(), {
        nombre: cliente.nombre || "",
        apellido: cliente.apellido || "",
        direccion: direccion || "Sin dirección",
        telefono: cliente.celular || "",
        email: cliente.email || "",
      })
    })
  } catch (error) {
    console.error("Error al cargar clientes:", error)
  }
  return clientesMap
}

function transformTicketItem(
  ticket: TicketItem,
  clientesMap: Map<string, ClienteInfo>,
  tecnicos: Tecnico[],
  reassignedIds: Set<number>,
  technicianOverrides: Record<string, string>
): Ticket {
  const actualizaciones = ticket.attributes.actualizacion || []
  const primeraDescripcion =
    actualizaciones.length > 0 ? actualizaciones[0].descripcion : "Sin descripción disponible"
  const clienteInfo = clientesMap.get(ticket.attributes.id_cliente)
  const idTecnicoOverride = technicianOverrides[ticket.id.toString()]
  const idTecnico = idTecnicoOverride || ticket.attributes.id_tecnico || ""

  return {
    id: `TK-${ticket.id.toString().padStart(3, "0")}`,
    idReal: ticket.id,
    fecha: ticket.attributes.fecha,
    id_cliente: ticket.attributes.id_cliente,
    estatus: ticket.attributes.estatus,
    id_tecnico: idTecnico,
    descripcion: primeraDescripcion,
    fechaCreacion: new Date(ticket.attributes.createdAt).toLocaleString("es-ES"),
    ultimaActualizacion: new Date(ticket.attributes.updatedAt).toLocaleString("es-ES"),
    actualizaciones,
    clienteInfo,
    nombreTecnico: resolveTecnicoNombre(idTecnico, tecnicos),
    reasignado: ticket.attributes.reasignado === true || reassignedIds.has(ticket.id),
  }
}

function matchesSearch(ticket: Ticket, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true
  const q = searchTerm.toLowerCase().trim()
  const cliente = ticket.clienteInfo
  const nombreCompleto = cliente ? `${cliente.nombre} ${cliente.apellido}`.trim().toLowerCase() : ""

  return (
    ticket.id.toLowerCase().includes(q) ||
    ticket.id_cliente.toLowerCase().includes(q) ||
    ticket.descripcion.toLowerCase().includes(q) ||
    nombreCompleto.includes(q) ||
    (cliente?.nombre?.toLowerCase().includes(q) ?? false) ||
    (cliente?.apellido?.toLowerCase().includes(q) ?? false) ||
    (cliente?.email?.toLowerCase().includes(q) ?? false) ||
    (cliente?.telefono?.includes(q) ?? false)
  )
}

function matchesTicketStatus(ticket: Ticket, filter: TicketStatusFilter): boolean {
  if (filter === "todos") return true
  if (filter === "en_proceso") return ticket.estatus === "En proceso"
  return ticket.estatus === "Finalizado"
}

export default function TicketTracker({ onStatusUpdate }: TicketTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [ticketStatusFilter, setTicketStatusFilter] = useState<TicketStatusFilter>("en_proceso")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [updateDescription, setUpdateDescription] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [isReassigning, setIsReassigning] = useState(false)
  const [selectedNewTecnico, setSelectedNewTecnico] = useState<string>("")
  const [isReassigningSaving, setIsReassigningSaving] = useState(false)
  const [reassignError, setReassignError] = useState<string | null>(null)
  const [reassignSuccess, setReassignSuccess] = useState(false)
  const permissions = getUserPermissions()

  const loadTecnicos = useCallback(async () => {
    try {
      const response = await UsuariosService.obtenerTecnicos()
      return response.map((usuario) => ({
        id: usuario.id.toString(),
        nombre: usuario.attributes.nombre || "Sin nombre",
      }))
    } catch (err) {
      console.error("Error al cargar técnicos:", err)
      return []
    }
  }, [])

  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response: TicketListResponse = await ticketService.getTickets()
      const reassignedIds = getReassignedIds()
      const technicianOverrides = getTechnicianOverrides()

      const sortedData = [...response.data].sort((a, b) => {
        const dateA = new Date(a.attributes.createdAt).getTime()
        const dateB = new Date(b.attributes.createdAt).getTime()
        return dateB - dateA
      })

      const clientIds = sortedData.map((ticket) => ticket.attributes.id_cliente)

      const [tecnicosDataResolved, clientesMap] = await Promise.all([
        loadTecnicos(),
        fetchClientesMap(clientIds),
      ])

      setTecnicos(tecnicosDataResolved)

      const transformedTickets = sortedData.map((ticket) =>
        transformTicketItem(
          ticket,
          clientesMap,
          tecnicosDataResolved,
          reassignedIds,
          technicianOverrides
        )
      )

      setTickets(transformedTickets)
    } catch (err: unknown) {
      console.error("Error al cargar tickets:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }, [loadTecnicos])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  useEffect(() => {
    if (selectedTicket) {
      setNewStatus(selectedTicket.estatus)
      setUpdateDescription("")
      setUpdateError(null)
      setUpdateSuccess(false)
      setIsReassigning(false)
      setSelectedNewTecnico(selectedTicket.id_tecnico)
      setReassignError(null)
      setReassignSuccess(false)
    }
  }, [selectedTicket])

  const refreshTicketsList = async (tecnicosData: Tecnico[]) => {
    const ticketsResponse: TicketListResponse = await ticketService.getTickets()
    const reassignedIds = getReassignedIds()
    const technicianOverrides = getTechnicianOverrides()

    const sortedData = [...ticketsResponse.data].sort((a, b) => {
      const dateA = new Date(a.attributes.createdAt).getTime()
      const dateB = new Date(b.attributes.createdAt).getTime()
      return dateB - dateA
    })

    const clientIds = sortedData.map((ticket) => ticket.attributes.id_cliente)
    const clientesMap = await fetchClientesMap(clientIds)

    return sortedData.map((ticket) =>
      transformTicketItem(ticket, clientesMap, tecnicosData, reassignedIds, technicianOverrides)
    )
  }

  const handleUpdateStatus = async () => {
    if (!selectedTicket) return

    if (!updateDescription.trim()) {
      setUpdateError("Por favor, ingresa el reporte del técnico")
      return
    }

    setIsUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(false)

    try {
      const ticketData: TicketRequest = {
        data: {
          fecha: selectedTicket.fecha,
          id_cliente: parseInt(selectedTicket.id_cliente),
          estatus: newStatus,
          id_tecnico: selectedTicket.id_tecnico ? parseInt(selectedTicket.id_tecnico) : null,
        },
      }

      await ticketService.updateTicket(selectedTicket.idReal, ticketData)
      setUpdateSuccess(true)

      const transformedTickets = await refreshTicketsList(tecnicos)
      setTickets(transformedTickets)

      if (onStatusUpdate) {
        onStatusUpdate()
      }

      setTimeout(() => {
        setSelectedTicket(null)
        setUpdateDescription("")
        setUpdateSuccess(false)
      }, 1000)
    } catch (err: unknown) {
      console.error("Error al actualizar el ticket:", err)
      setUpdateError(err instanceof Error ? err.message : "Error al actualizar el ticket")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReassignAction = async () => {
    if (!selectedTicket) return

    if (!isReassigning) {
      setIsReassigning(true)
      setSelectedNewTecnico(selectedTicket.id_tecnico)
      setReassignError(null)
      setReassignSuccess(false)
      return
    }

    const hasChanged = selectedNewTecnico !== selectedTicket.id_tecnico

    if (!hasChanged) {
      setIsReassigning(false)
      setSelectedNewTecnico(selectedTicket.id_tecnico)
      return
    }

    setIsReassigningSaving(true)
    setReassignError(null)
    setReassignSuccess(false)

    try {
      const ticketData: TicketRequest = {
        data: {
          fecha: selectedTicket.fecha,
          id_cliente: parseInt(selectedTicket.id_cliente),
          estatus: selectedTicket.estatus,
          id_tecnico: parseInt(selectedNewTecnico),
          // reasignado: true — pendiente de soporte en la API
        },
      }

      if (!SIMULAR_REASIGNACION) {
        await ticketService.updateTicket(selectedTicket.idReal, ticketData)
      }

      markTicketReassigned(selectedTicket.idReal)
      saveTechnicianOverride(selectedTicket.idReal, selectedNewTecnico)

      const nuevoNombre = resolveTecnicoNombre(selectedNewTecnico, tecnicos)
      const updatedTicket: Ticket = {
        ...selectedTicket,
        id_tecnico: selectedNewTecnico,
        nombreTecnico: nuevoNombre,
        reasignado: true,
      }

      setSelectedTicket(updatedTicket)
      setTickets((prev) =>
        prev.map((t) => (t.idReal === updatedTicket.idReal ? updatedTicket : t))
      )
      setIsReassigning(false)
      setReassignSuccess(true)
    } catch (err: unknown) {
      console.error("Error al reasignar el ticket:", err)
      setReassignError(
        err instanceof Error ? err.message : "Error al reasignar el ticket"
      )
    } finally {
      setIsReassigningSaving(false)
    }
  }

  const filteredTickets = tickets.filter(
    (ticket) => matchesSearch(ticket, searchTerm) && matchesTicketStatus(ticket, ticketStatusFilter)
  )

  const getStatusColor = (status: string) => {
    return status === "En proceso"
      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
      : "bg-green-100 text-green-800 border-green-300"
  }

  const canReassign =
    selectedTicket?.estatus === "En proceso" && permissions?.canUpdateTicketStatus

  const reassignButtonLabel = isReassigning
    ? selectedNewTecnico !== selectedTicket?.id_tecnico
      ? "Guardar"
      : "Cancelar"
    : "Reasignar"

  const hasTecnicoChange =
    isReassigning && selectedNewTecnico !== selectedTicket?.id_tecnico

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Cargando tickets...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error al cargar tickets</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <Button onClick={() => loadTickets()} className="mt-4" variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-gray-900">Seguimiento de Tickets</CardTitle>
            </div>
            <CardDescription>Busca y consulta el estado de tus tickets de soporte</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Búsqueda y filtros en la misma fila */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Ticket</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Buscar por ID, nombre, correo, teléfono o ID del cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {(
                    [
                      { value: "en_proceso", label: "En Proceso" },
                      { value: "finalizados", label: "Finalizados" },
                      { value: "todos", label: "Todos" },
                    ] as const
                  ).map(({ value, label }) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={ticketStatusFilter === value ? "default" : "outline"}
                      onClick={() => setTicketStatusFilter(value)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-xl font-bold text-blue-900">{tickets.length}</p>
                      <p className="text-sm text-blue-700">Total de Tickets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="text-xl font-bold text-yellow-900">
                        {tickets.filter((t) => t.estatus === "En proceso").length}
                      </p>
                      <p className="text-sm text-yellow-700">En Proceso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Search className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-xl font-bold text-green-900">
                        {tickets.filter((t) => t.estatus === "Finalizado").length}
                      </p>
                      <p className="text-sm text-green-700">Finalizados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de tickets */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tickets Encontrados ({filteredTickets.length})
              </h3>

              {filteredTickets.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {tickets.length === 0
                      ? "No hay tickets disponibles"
                      : "No se encontraron tickets que coincidan con tu búsqueda o filtro"}
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-lg font-semibold text-gray-900">{ticket.id}</h4>
                            <Badge className={getStatusColor(ticket.estatus)}>{ticket.estatus}</Badge>
                            {ticket.reasignado && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                                Reasignado
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>
                              Cliente:{" "}
                              {ticket.clienteInfo
                                ? `${ticket.clienteInfo.nombre} ${ticket.clienteInfo.apellido}`.trim()
                                : ticket.id_cliente}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Fecha: {ticket.fecha}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Técnico: {ticket.nombreTecnico}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm line-clamp-2">{ticket.descripcion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de detalles del ticket */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-xl">Detalles del Ticket {selectedTicket.id}</CardTitle>
                    {selectedTicket.reasignado && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        Reasignado
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(null)
                      setUpdateDescription("")
                      setUpdateError(null)
                      setUpdateSuccess(false)
                      setIsReassigning(false)
                      setReassignError(null)
                      setReassignSuccess(false)
                    }}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">ID del Ticket</Label>
                    <p className="text-gray-700">{selectedTicket.id}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Estatus</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedTicket.estatus)}>
                        {selectedTicket.estatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Cliente</Label>
                    <p className="text-gray-700">
                      {selectedTicket.clienteInfo
                        ? `${selectedTicket.clienteInfo.nombre} ${selectedTicket.clienteInfo.apellido}`.trim()
                        : `ID: ${selectedTicket.id_cliente}`}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold">Técnico</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {isReassigning ? (
                        <Select value={selectedNewTecnico} onValueChange={setSelectedNewTecnico}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecciona un técnico" />
                          </SelectTrigger>
                          <SelectContent>
                            {tecnicos.map((tecnico) => (
                              <SelectItem key={tecnico.id} value={tecnico.id}>
                                {tecnico.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-gray-700 flex-1">{selectedTicket.nombreTecnico}</p>
                      )}
                      {canReassign && (
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            isReassigning &&
                            selectedNewTecnico !== selectedTicket.id_tecnico
                              ? "default"
                              : "outline"
                          }
                          onClick={handleReassignAction}
                          disabled={isReassigningSaving || tecnicos.length === 0}
                        >
                          {isReassigningSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              {getReassignButtonIcon(isReassigning, hasTecnicoChange)}
                              {reassignButtonLabel}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    {SIMULAR_REASIGNACION && canReassign && (
                      <p className="text-xs text-amber-600 mt-1">
                        TODO: Reasignación se guarda localmente hasta que la API lo soporte por completo.
                      </p>
                    )}
                    {reassignError && (
                      <p className="text-sm text-red-600 mt-1">{reassignError}</p>
                    )}
                    {reassignSuccess && (
                      <p className="text-sm text-green-600 mt-1">
                        Técnico reasignado correctamente
                      </p>
                    )}
                  </div>
                  {selectedTicket.clienteInfo && (
                    <>
                      <div className="md:col-span-2">
                        <Label className="font-semibold">Dirección</Label>
                        <p className="text-gray-700 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedTicket.clienteInfo.direccion}
                        </p>
                      </div>
                      <div>
                        <Label className="font-semibold">Teléfono</Label>
                        <p className="text-gray-700 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedTicket.clienteInfo.telefono || "Sin teléfono"}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <Label className="font-semibold">Fecha de Creación</Label>
                    <p className="text-gray-700">{selectedTicket.fechaCreacion}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Última Actualización</Label>
                    <p className="text-gray-700">{selectedTicket.ultimaActualizacion}</p>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Descripción del Problema</Label>
                  <p className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-md">
                    {selectedTicket.descripcion || "No hay descripción disponible"}
                  </p>
                </div>

                <div>
                  <Label className="font-semibold">Reporte del técnico</Label>
                  {selectedTicket.actualizaciones && selectedTicket.actualizaciones.length > 1 ? (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[80px]">
                      <div className="space-y-2">
                        {selectedTicket.actualizaciones.slice(1).map((actualizacion, index) => (
                          <div
                            key={actualizacion.id || index + 1}
                            className="pb-2 border-b border-gray-200 last:border-0 last:pb-0"
                          >
                            <div className="text-xs text-gray-500 mb-1">
                              {actualizacion.fecha
                                ? new Date(actualizacion.fecha + "T00:00:00").toLocaleDateString(
                                    "es-ES",
                                    { year: "numeric", month: "long", day: "numeric" }
                                  )
                                : actualizacion.fecha}
                            </div>
                            <p className="text-gray-700 text-sm">{actualizacion.descripcion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1 p-3 bg-gray-50 rounded-md min-h-[80px]">
                      No hay reporte disponible
                    </p>
                  )}
                </div>

                {selectedTicket.estatus !== "Finalizado" && permissions?.canUpdateTicketStatus && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Cambiar Estatus del Ticket
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="status-select" className="font-semibold">
                          Nuevo Estatus
                        </Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger id="status-select" className="mt-1">
                            <SelectValue placeholder="Selecciona un estatus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="En proceso">En proceso</SelectItem>
                            <SelectItem value="Finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="update-description" className="font-semibold">
                          Reporte del técnico
                        </Label>
                        <Textarea
                          id="update-description"
                          placeholder="Ingresa el reporte del técnico..."
                          value={updateDescription}
                          onChange={(e) => setUpdateDescription(e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      </div>

                      {updateError && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                          {updateError}
                        </div>
                      )}

                      {updateSuccess && (
                        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                          Ticket actualizado exitosamente
                        </div>
                      )}

                      <Button
                        onClick={handleUpdateStatus}
                        disabled={isUpdating || newStatus === selectedTicket.estatus}
                        className="w-full"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Calendar, User, FileText, Clock, Loader2, Save, MapPin, Phone } from "lucide-react"
import { ticketService } from "@/lib/ticketService"
import { TicketListResponse, TicketRequest, TicketActualizacion } from "@/types/ticket"
import axios from "axios"

// Lista hardcodeada de técnicos
const TECNICOS = [
  { id: "1", nombre: "Juan Pérez" },
  { id: "3", nombre: "Carlos Rodríguez" },
  { id: "5", nombre: "Luis Hernández" },
  { id: "7", nombre: "Pedro López" },
  { id: "9", nombre: "Roberto Torres" },
]

interface ClienteInfo {
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
}

interface Ticket {
  id: string;
  idReal: number; // ID real del ticket para la API
  fecha: string;
  id_cliente: string;
  estatus: string;
  id_tecnico: string;
  descripcion: string;
  fechaCreacion: string;
  ultimaActualizacion: string;
  actualizaciones: TicketActualizacion[]; // Array de actualizaciones/comentarios
  clienteInfo?: ClienteInfo; // Información del cliente
  nombreTecnico?: string; // Nombre del técnico
}

interface TicketTrackerProps {
  onStatusUpdate?: () => void;
}

export default function TicketTracker({ onStatusUpdate }: TicketTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [updateDescription, setUpdateDescription] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [ticketDetails, setTicketDetails] = useState<any>(null) // Detalles completos del ticket

  // Cargar tickets desde la API
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response: TicketListResponse = await ticketService.getTickets()
        console.log('response', response.data)
        
        // Ordenar por fecha de creación (más nuevos primero) antes de transformar
        const sortedData = [...response.data].sort((a, b) => {
          const dateA = new Date(a.attributes.createdAt).getTime()
          const dateB = new Date(b.attributes.createdAt).getTime()
          return dateB - dateA // Orden descendente (más nuevos primero)
        })
        
        // Obtener todos los clientes de la API
        const clientesMap = new Map<string, ClienteInfo>()
        try {
          const clientesResponse = await axios.get('https://monkfish-app-2et8k.ondigitalocean.app/api/users?populate=*')
          if (clientesResponse.data && Array.isArray(clientesResponse.data)) {
            clientesResponse.data.forEach((cliente: any) => {
              const direccion = `${cliente.calle || ''} ${cliente.num_exterior || ''} ${cliente.num_interior || ''}, ${cliente.colonia || ''}, ${cliente.ciudad || ''}`.trim(); 
              clientesMap.set(cliente.id.toString(), {
                nombre: cliente.nombre || '',
                apellido: cliente.apellido || '',
                direccion: direccion || 'Sin dirección',
                telefono: cliente.celular || 'Sin teléfono'
              })
            })
          }
        } catch (error) {
          console.error("Error al cargar clientes:", error)
        }

        // Transformar los datos de la API al formato del componente
        const transformedTickets: Ticket[] = await Promise.all(
          sortedData.map(async (ticket) => {
            const actualizaciones = ticket.attributes.actualizacion || []
            // Obtener la primera descripción de las actualizaciones (descripción inicial del problema)
            const primeraDescripcion = actualizaciones.length > 0 
              ? actualizaciones[0].descripcion 
              : "Sin descripción disponible"
            
            // Obtener información del cliente
            const clienteInfo = clientesMap.get(ticket.attributes.id_cliente)
            
            // Obtener nombre del técnico
            const tecnico = TECNICOS.find(t => t.id === ticket.attributes.id_tecnico)
            const nombreTecnico = tecnico ? tecnico.nombre : (ticket.attributes.id_tecnico || "No asignado")
            
            return {
              id: `TK-${ticket.id.toString().padStart(3, '0')}`,
              idReal: ticket.id, // Guardar el ID real para actualizaciones
              fecha: ticket.attributes.fecha,
              id_cliente: ticket.attributes.id_cliente,
              estatus: ticket.attributes.estatus,
              id_tecnico: ticket.attributes.id_tecnico || "",
              descripcion: primeraDescripcion,
              fechaCreacion: new Date(ticket.attributes.createdAt).toLocaleString('es-ES'),
              ultimaActualizacion: new Date(ticket.attributes.updatedAt).toLocaleString('es-ES'),
              actualizaciones: actualizaciones,
              clienteInfo: clienteInfo,
              nombreTecnico: nombreTecnico,
            }
          })
        )
        
        setTickets(transformedTickets)
      } catch (error: any) {
        console.error("Error al cargar tickets:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadTickets()
  }, [])

  // Resetear estados cuando se selecciona un ticket
  useEffect(() => {
    if (selectedTicket) {
      setNewStatus(selectedTicket.estatus)
      setUpdateDescription("")
      setUpdateError(null)
      setUpdateSuccess(false)
    }
  }, [selectedTicket])

  // Función para actualizar el estatus del ticket
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
      // const fechaActual = new Date().toISOString().split('T')[0]
      
      // // Obtener actualizaciones existentes si hay
      // let actualizacionesExistentes: any[] = []
      // if (ticketDetails?.data?.attributes?.actualizacion && Array.isArray(ticketDetails.data.attributes.actualizacion)) {
      //   actualizacionesExistentes = ticketDetails.data.attributes.actualizacion
      // }
      
      // // Agregar la nueva actualización
      // const nuevaActualizacion = {
      //   fecha: fechaActual,
      //   descripcion: updateDescription
      // }
      
      const ticketData: TicketRequest = {
        data: {
          fecha: selectedTicket.fecha,
          id_cliente: parseInt(selectedTicket.id_cliente),
          estatus: newStatus,
          id_tecnico: selectedTicket.id_tecnico ? parseInt(selectedTicket.id_tecnico) : null,
          // actualizacion: [...actualizacionesExistentes, nuevaActualizacion]
          // actualizacion: [] // Temporalmente comentado hasta que el servicio lo soporte
        }
      }

      console.log("Enviando actualización:", JSON.stringify(ticketData, null, 2))
      const updateResponse = await ticketService.updateTicket(selectedTicket.idReal, ticketData)
      console.log("Respuesta de actualización:", updateResponse)
      
      setUpdateSuccess(true)
      
      // Recargar los tickets para reflejar los cambios
      const ticketsResponse: TicketListResponse = await ticketService.getTickets()
      
      // Obtener todos los clientes de la API
      const clientesMap = new Map<string, ClienteInfo>()
      try {
        const clientesResponse = await axios.get('https://monkfish-app-2et8k.ondigitalocean.app/api/users?populate=*')
        if (clientesResponse.data && Array.isArray(clientesResponse.data)) {
          clientesResponse.data.forEach((cliente: any) => {
            const direccion = `${cliente.calle || ''} ${cliente.num_exterior || ''} ${cliente.num_interior || ''}`.trim() || 
                             `${cliente.colonia || ''}, ${cliente.ciudad || ''}, ${cliente.estado || ''}`.trim()
            clientesMap.set(cliente.id.toString(), {
              nombre: cliente.nombre || '',
              apellido: cliente.apellido || '',
              direccion: direccion || 'Sin dirección',
              telefono: cliente.celular || 'Sin teléfono'
            })
          })
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error)
      }
      
      // Ordenar por fecha de creación (más nuevos primero) antes de transformar
      const sortedData = [...ticketsResponse.data].sort((a, b) => {
        const dateA = new Date(a.attributes.createdAt).getTime()
        const dateB = new Date(b.attributes.createdAt).getTime()
        return dateB - dateA // Orden descendente (más nuevos primero)
      })
      
      const transformedTickets: Ticket[] = sortedData.map((ticket) => {
        const actualizaciones = ticket.attributes.actualizacion || []
        // Obtener la primera descripción de las actualizaciones (descripción inicial del problema)
        const primeraDescripcion = actualizaciones.length > 0 
          ? actualizaciones[0].descripcion 
          : "Sin descripción disponible"
        
        // Obtener información del cliente
        const clienteInfo = clientesMap.get(ticket.attributes.id_cliente)
        
        // Obtener nombre del técnico
        const tecnico = TECNICOS.find(t => t.id === ticket.attributes.id_tecnico)
        const nombreTecnico = tecnico ? tecnico.nombre : (ticket.attributes.id_tecnico || "No asignado")
        
        return {
          id: `TK-${ticket.id.toString().padStart(3, '0')}`,
          idReal: ticket.id,
          fecha: ticket.attributes.fecha,
          id_cliente: ticket.attributes.id_cliente,
          estatus: ticket.attributes.estatus,
          id_tecnico: ticket.attributes.id_tecnico || "",
          descripcion: primeraDescripcion,
          fechaCreacion: new Date(ticket.attributes.createdAt).toLocaleString('es-ES'),
          ultimaActualizacion: new Date(ticket.attributes.updatedAt).toLocaleString('es-ES'),
          actualizaciones: actualizaciones,
          clienteInfo: clienteInfo,
          nombreTecnico: nombreTecnico,
        }
      })
      
      setTickets(transformedTickets)
      
      // Actualizar estadísticas en el dashboard si hay callback
      if (onStatusUpdate) {
        onStatusUpdate()
      }

      // Cerrar el modal después de guardar exitosamente
      setTimeout(() => {
        setSelectedTicket(null)
        setUpdateDescription("")
        setUpdateSuccess(false)
        setTicketDetails(null)
      }, 1000)
      
    } catch (error: any) {
      console.error("Error al actualizar el ticket:", error)
      setUpdateError(error.message || "Error al actualizar el ticket")
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )
console.log('filteredTickets', filteredTickets)
  const getStatusColor = (status: string) => {
    return status === "En proceso"
      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
      : "bg-green-100 text-green-800 border-green-300"
  }

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
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
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
            {/* Barra de búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Ticket</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar por ID de ticket, cliente o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                        {tickets.filter(t => t.estatus === "En proceso").length}
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
                        {tickets.filter(t => t.estatus === "Finalizado").length}
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
                      : "No se encontraron tickets que coincidan con tu búsqueda"
                    }
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-semibold text-gray-900">{ticket.id}</h4>
                            <Badge className={getStatusColor(ticket.estatus)}>{ticket.estatus}</Badge>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            // Usar directamente los datos del ticket que ya tenemos en la lista
                            setSelectedTicket(ticket)
                            setTicketDetails(null)
                          }}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>Cliente: {ticket.clienteInfo ? `${ticket.clienteInfo.nombre} ${ticket.clienteInfo.apellido}`.trim() : ticket.id_cliente}</span>
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
                  <CardTitle className="text-xl">Detalles del Ticket {selectedTicket.id}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedTicket(null)
                    setUpdateDescription("")
                    setUpdateError(null)
                    setUpdateSuccess(false)
                  }}>
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
                      <Badge className={getStatusColor(selectedTicket.estatus)}>{selectedTicket.estatus}</Badge>
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
                    <p className="text-gray-700">{selectedTicket.nombreTecnico}</p>
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
                          {selectedTicket.clienteInfo.telefono}
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
                {/* Descripción del Problema */}
                <div>
                  <Label className="font-semibold">Descripción del Problema</Label>
                  <p className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-md">
                    {selectedTicket.descripcion || "No hay descripción disponible"}
                  </p>
                </div>

                {/* Reporte del técnico - Mostrar actualizaciones excepto la primera (que ya está en Descripción del Problema) */}
                <div>
                  <Label className="font-semibold">Reporte del técnico</Label>
                  {selectedTicket.actualizaciones && selectedTicket.actualizaciones.length > 1 ? (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[80px]">
                      <div className="space-y-2">
                        {selectedTicket.actualizaciones.slice(1).map((actualizacion, index) => (
                          <div key={actualizacion.id || index + 1} className="pb-2 border-b border-gray-200 last:border-0 last:pb-0">
                            <div className="text-xs text-gray-500 mb-1">
                              {actualizacion.fecha 
                                ? new Date(actualizacion.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
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

                {/* Sección para cambiar estatus - Solo si no está finalizado */}
                {selectedTicket.estatus !== "Finalizado" && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Estatus del Ticket</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="status-select" className="font-semibold">Nuevo Estatus</Label>
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

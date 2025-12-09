"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Calendar, User, FileText, Clock, Loader2 } from "lucide-react"
import { ticketService } from "@/lib/ticketService"
import { TicketListResponse } from "@/types/ticket"

interface Ticket {
  id: string;
  fecha: string;
  id_cliente: string;
  estatus: string;
  id_tecnico: string;
  descripcion: string;
  fechaCreacion: string;
  ultimaActualizacion: string;
}

export default function TicketTracker() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar tickets desde la API
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response: TicketListResponse = await ticketService.getTickets()
        console.log('response', response.data)
        // Transformar los datos de la API al formato del componente
        const transformedTickets: Ticket[] = response.data.map((ticket) => ({
          id: `TK-${ticket.id.toString().padStart(3, '0')}`,
          fecha: ticket.attributes.fecha,
          id_cliente: ticket.attributes.id_cliente,
          estatus: ticket.attributes.estatus,
          id_tecnico: ticket.attributes.id_tecnico,
          descripcion: "Descripción del ticket", // La API no devuelve descripción en el listado
          fechaCreacion: new Date(ticket.attributes.createdAt).toLocaleString('es-ES'),
          ultimaActualizacion: new Date(ticket.attributes.updatedAt).toLocaleString('es-ES'),
        }))
        
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
                          <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>Cliente: {ticket.id_cliente}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Fecha: {ticket.fecha}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Actualizado: {ticket.ultimaActualizacion}</span>
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                    Cerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label className="font-semibold">ID Cliente</Label>
                    <p className="text-gray-700">{selectedTicket.id_cliente}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">ID Técnico</Label>
                    <p className="text-gray-700">{selectedTicket.id_tecnico}</p>
                  </div>
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
                  <p className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-md">{selectedTicket.descripcion}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

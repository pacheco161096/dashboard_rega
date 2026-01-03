"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, TicketIcon, ArrowLeft, FileText, Clock, Loader2 } from "lucide-react"
import TicketForm from "@/components/molecules/TicketForm/TicketForm"
import TicketTracker from "@/components/molecules/TicketTracker/TicketTracker"
import { TicketFormData } from "@/types/ticket"
import { useTicketForm } from "@/hooks/useTicketForm"
import { useTicketStats } from "@/hooks/useTicketStats"

type ViewType = "dashboard" | "create" | "track"

export default function Reportes() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const { isLoading, error, success, submitTicket } = useTicketForm()
  const { total, enProceso, finalizados, isLoading: statsLoading } = useTicketStats()

  // Memoizar handlers de cambio de vista
  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view)
  }, [])

  const handleBackToDashboard = useCallback(() => {
    setCurrentView("dashboard")
  }, [])

  // Memoizar handleSubmit
  const handleSubmit = useCallback(async (formData: TicketFormData, e: React.FormEvent) => {
    e.preventDefault()
    await submitTicket(formData)
  }, [submitTicket])

  // Mostrar alerta cuando el ticket se crea exitosamente
  useEffect(() => {
    if (success) {
      alert("Ticket creado exitosamente")
    }
  }, [success])

  // Memoizar la vista renderizada
  const renderedView = useMemo(() => {
    switch (currentView) {
      case "create":
        return (
          <div>
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                Ticket creado exitosamente
              </div>
            )}
            
            <TicketForm 
              handleSubmit={handleSubmit} 
              isLoading={isLoading}
            />
          </div>
        )
      case "track":
        return (
          <div>
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
            <TicketTracker />
          </div>
        )
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <TicketIcon className="h-10 w-10 text-blue-600" />
                  <h1 className="text-4xl font-bold text-gray-900">Sistema de Tickets</h1>
                </div>
                <p className="text-lg text-gray-600">Gestiona y da seguimiento a tus tickets de soporte</p>
              </div>

              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Crear Nuevo Ticket */}
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <PlusCircle className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-900">Crear Nuevo Ticket</CardTitle>
                    <CardDescription className="text-gray-600">
                      Levanta un nuevo ticket de soporte con toda la información necesaria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={() => handleViewChange("create")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Crear Ticket
                    </Button>
                  </CardContent>
                </Card>

                {/* Seguimiento de Tickets */}
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Search className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-900">Seguimiento de Tickets</CardTitle>
                    <CardDescription className="text-gray-600">
                      Consulta el estado y progreso de tus tickets anteriores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={() => handleViewChange("track")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Ver Tickets
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        {statsLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="text-sm text-blue-700">Cargando...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-blue-900">{total}</p>
                            <p className="text-sm text-blue-700">Tickets Totales</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div>
                        {statsLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
                            <span className="text-sm text-yellow-700">Cargando...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-yellow-900">{enProceso}</p>
                            <p className="text-sm text-yellow-700">En Proceso</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TicketIcon className="h-8 w-8 text-green-600" />
                      <div>
                        {statsLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                            <span className="text-sm text-green-700">Cargando...</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-green-900">{finalizados}</p>
                            <p className="text-sm text-green-700">Finalizados</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )
    }
  }, [currentView, error, success, isLoading, handleSubmit, handleBackToDashboard, handleViewChange, total, enProceso, finalizados, statsLoading])

  return <div>{renderedView}</div>
}
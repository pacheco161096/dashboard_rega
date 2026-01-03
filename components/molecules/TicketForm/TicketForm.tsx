"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, TicketIcon, Loader2 } from "lucide-react"
import { TicketFormData } from "@/types/ticket"

interface TicketFormProps {
  handleSubmit: (formData: TicketFormData, e: React.FormEvent) => void;
  isLoading?: boolean;
}

export default function TicketForm({ handleSubmit, isLoading = false }: TicketFormProps) {
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState<TicketFormData>({
    fecha: getCurrentDate(),
    id_cliente: "",
    estatus: "En proceso",
    id_tecnico: "",
    descripcion: "",
  })

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    if (isLoading) return; // Prevenir envío múltiple
    handleSubmit(formData, e);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TicketIcon className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-900">Crear Nuevo Ticket</CardTitle>
          </div>
          <CardDescription>Complete el formulario para levantar un nuevo ticket de soporte</CardDescription>
        </CardHeader>

        <form onSubmit={handleFormSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Fecha
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              {/* ID Cliente */}
              <div className="space-y-2">
                <Label htmlFor="id_cliente">ID Cliente</Label>
                <Input
                  id="id_cliente"
                  type="text"
                  placeholder="Ingrese el ID del cliente"
                  value={formData.id_cliente}
                  onChange={(e) => handleInputChange("id_cliente", e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estatus */}
              <div className="space-y-2">
                <Label htmlFor="estatus">Estatus</Label>
                <Select
                  value={formData.estatus}
                  onValueChange={(value) => handleInputChange("estatus", value)}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ID Técnico */}
              <div className="space-y-2">
                <Label htmlFor="id_tecnico">ID Técnico</Label>
                <Input
                  id="id_tecnico"
                  type="text"
                  value={formData.id_tecnico}
                  onChange={(e) => handleInputChange("id_tecnico", e.target.value)}
                  className="w-full bg-gray-50"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">ID del técnico asignado por defecto</p>
              </div>
            </div>

            {/* Descripción del Reporte */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Reporte</Label>
              <Textarea
                id="descripcion"
                placeholder="Describa detalladamente el problema o solicitud..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                required
                rows={5}
                className="w-full resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Proporcione todos los detalles relevantes del problema</p>
            </div>

            {/* Resumen de datos */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Resumen del Ticket</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Fecha:</span> {formData.fecha || "No especificada"}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span> {formData.id_cliente || "No especificado"}
                </div>
                <div>
                  <span className="font-medium">Estatus:</span> {formData.estatus || "No seleccionado"}
                </div>
                <div>
                  <span className="font-medium">Técnico:</span> {formData.id_tecnico}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() =>
                setFormData({
                  fecha: getCurrentDate(),
                  id_cliente: "",
                  estatus: "En proceso",
                  id_tecnico: "",
                  descripcion: "",
                })
              }
              disabled={isLoading}
            >
              Limpiar Formulario
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando Ticket...
                </>
              ) : (
                "Crear Ticket"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

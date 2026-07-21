"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, TicketIcon, Loader2 } from "lucide-react"
import { TicketFormData } from "@/types/ticket"
import { UsuariosService } from "@/lib/services/usuariosService"
import ClientSearchSelect from "@/components/molecules/ClientSearchSelect/ClientSearchSelect"
import {
  firstFieldErrorMessage,
  hasFieldErrors,
  validateTicketForm,
  type FieldErrors,
} from "@/lib/utils/formValidation"
import { useToast } from "@/hooks/use-toast"
import type { CustomerListItem } from "@/lib/services/customersService"

interface Tecnico {
  id: string
  nombre: string
}

interface TicketFormProps {
  handleSubmit: (formData: TicketFormData, e: React.FormEvent) => void;
  isLoading?: boolean;
  initialClienteId?: string;
}

function getCurrentDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function TicketForm({ handleSubmit, isLoading = false, initialClienteId = "" }: TicketFormProps) {
  const { toast } = useToast()
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loadingTecnicos, setLoadingTecnicos] = useState(true)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [selectedClientLabel, setSelectedClientLabel] = useState("")

  const [formData, setFormData] = useState<TicketFormData>({
    fecha: getCurrentDate(),
    id_cliente: initialClienteId,
    estatus: "En proceso",
    id_tecnico: "",
    descripcion: "",
  })

  useEffect(() => {
    let cancelled = false;

    const fetchTecnicos = async () => {
      try {
        setLoadingTecnicos(true)
        const response = await UsuariosService.obtenerTecnicos()
        if (cancelled) return

        const tecnicosData = response.map((usuario) => ({
          id: usuario.id.toString(),
          nombre: usuario.attributes.nombre || "Sin nombre",
        }))

        setTecnicos(tecnicosData)
      } catch {
        if (cancelled) return
        setTecnicos([])
        toast({
          title: "Error al cargar técnicos",
          description: "No se pudieron obtener los técnicos. Intente recargar la página.",
          variant: "destructive",
        })
      } finally {
        if (!cancelled) {
          setLoadingTecnicos(false)
        }
      }
    }

    fetchTecnicos()
    return () => {
      cancelled = true
    }
  }, [toast])

  useEffect(() => {
    if (initialClienteId) {
      setFormData((prev) => ({
        ...prev,
        id_cliente: initialClienteId,
      }))
    }
  }, [initialClienteId])

  const isFormComplete = useMemo(
    () => !hasFieldErrors(validateTicketForm(formData)),
    [formData]
  )

  const clearFieldError = (field: keyof TicketFormData) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    clearFieldError(field)
  }

  const handleClientChange = (clientId: string, client?: CustomerListItem | null) => {
    handleInputChange("id_cliente", clientId)
    if (client) {
      const fullName = [client.nombre, client.apellido].filter(Boolean).join(" ").trim()
      setSelectedClientLabel(fullName ? `${fullName} · ID: ${client.id}` : `ID: ${client.id}`)
    } else {
      setSelectedClientLabel("")
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const validationErrors = validateTicketForm(formData)
    if (hasFieldErrors(validationErrors)) {
      setErrors(validationErrors)
      toast({
        title: "Formulario incompleto",
        description: firstFieldErrorMessage(validationErrors),
        variant: "destructive",
      })
      return
    }

    setErrors({})
    handleSubmit(formData, e)
  }

  const handleReset = () => {
    setFormData({
      fecha: getCurrentDate(),
      id_cliente: "",
      estatus: "En proceso",
      id_tecnico: "",
      descripcion: "",
    })
    setSelectedClientLabel("")
    setErrors({})
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TicketIcon className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-900">Crear Nuevo Ticket</CardTitle>
          </div>
          <CardDescription>Complete el formulario para levantar un nuevo ticket de soporte</CardDescription>
        </CardHeader>

        <form onSubmit={handleFormSubmit} noValidate>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label htmlFor="fecha" className="flex items-center gap-2 mb-2 h-5">
                  <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                  <span>Fecha</span>
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  className={`w-full h-9 ${errors.fecha ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.fecha && <p className="mt-1 text-xs text-red-600">{errors.fecha}</p>}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="cliente" className="mb-2 h-5 flex items-center">
                  Cliente
                </Label>
                <ClientSearchSelect
                  value={formData.id_cliente}
                  onChange={handleClientChange}
                  onResolvedLabel={setSelectedClientLabel}
                  disabled={isLoading}
                  error={errors.id_cliente}
                  placeholder="Buscar por nombre o ID..."
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="estatus" className="mb-2 h-5 flex items-center">Estatus</Label>
                <Select
                  value={formData.estatus}
                  onValueChange={(value) => handleInputChange("estatus", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={`w-full h-9 ${errors.estatus ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Seleccione el estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estatus && <p className="mt-1 text-xs text-red-600">{errors.estatus}</p>}
              </div>

              <div className="flex flex-col">
                <Label htmlFor="id_tecnico" className="mb-2 h-5 flex items-center">Técnico</Label>
                <Select
                  value={formData.id_tecnico}
                  onValueChange={(value) => handleInputChange("id_tecnico", value)}
                  disabled={isLoading || loadingTecnicos}
                >
                  <SelectTrigger className={`w-full h-9 ${errors.id_tecnico ? "border-red-500" : ""}`}>
                    <SelectValue placeholder={loadingTecnicos ? "Cargando técnicos..." : "Seleccione un técnico"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicos.length === 0 && !loadingTecnicos ? (
                      <SelectItem value="no-tecnicos" disabled>
                        No hay técnicos disponibles
                      </SelectItem>
                    ) : (
                      tecnicos.map((tecnico) => (
                        <SelectItem key={tecnico.id} value={tecnico.id}>
                          {tecnico.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.id_tecnico ? (
                  <p className="mt-1 text-xs text-red-600">{errors.id_tecnico}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1 h-4">Seleccione el técnico asignado</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Reporte</Label>
              <Textarea
                id="descripcion"
                placeholder="Describa detalladamente el problema o solicitud..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                rows={5}
                className={`w-full resize-none ${errors.descripcion ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              {errors.descripcion ? (
                <p className="text-xs text-red-600">{errors.descripcion}</p>
              ) : (
                <p className="text-xs text-gray-500">Proporcione todos los detalles relevantes del problema</p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Resumen del Ticket</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Fecha:</span> {formData.fecha || "No especificada"}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span>{" "}
                  {selectedClientLabel || (formData.id_cliente ? `ID: ${formData.id_cliente}` : "No especificado")}
                </div>
                <div>
                  <span className="font-medium">Estatus:</span> {formData.estatus || "No seleccionado"}
                </div>
                <div>
                  <span className="font-medium">Técnico:</span>{" "}
                  {tecnicos.find((t) => t.id === formData.id_tecnico)?.nombre || formData.id_tecnico || "No asignado"}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleReset}
              disabled={isLoading}
            >
              Limpiar Formulario
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !isFormComplete}
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

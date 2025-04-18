"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClienteModal({ open, onOpenChange }: ClientModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    celular: "",
    rfc: "",
    curp: "",
    razon_social: "",
    regimen_fiscal: "",
    cfdi: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form data:", formData)
    // Aquí iría la lógica para enviar los datos al servidor
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogDescription>Complete la información para registrar un nuevo cliente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="personal">Datos Personales</TabsTrigger>
              <TabsTrigger value="fiscal">Datos Fiscales</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Correo"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    name="celular"
                    type="tel"
                    placeholder="Celular"
                    value={formData.celular}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="fiscal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rfc">R.F.C</Label>
                  <Input id="rfc" name="rfc" placeholder="R.F.C" value={formData.rfc} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curp">CURP</Label>
                  <Input id="curp" name="curp" placeholder="CURP" value={formData.curp} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="razon_social">Razón Social</Label>
                <Input
                  id="razon_social"
                  name="razon_social"
                  placeholder="Razón Social"
                  value={formData.razon_social}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regimen_fiscal">Régimen Fiscal</Label>
                  <Input
                    id="regimen_fiscal"
                    name="regimen_fiscal"
                    placeholder="Régimen Fiscal"
                    value={formData.regimen_fiscal}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cfdi">Uso CFDI</Label>
                  <Input id="cfdi" name="cfdi" placeholder="Uso CFDI" value={formData.cfdi} onChange={handleChange} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


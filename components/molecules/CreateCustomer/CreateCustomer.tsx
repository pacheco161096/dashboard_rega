"use client";

import { FC, useState, useCallback, useMemo } from "react";
import s from "./CreateCustomer.module.css";
import { Button } from "@/components/ui/button";
import { businessApi, handleApiError } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  firstFieldErrorMessage,
  hasFieldErrors,
  validateCustomerForm,
  type FieldErrors,
} from "@/lib/utils/formValidation";

export interface CreateCustomerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialUserData = {
  nombre: "",
  apellido: "",
  email: "",
  username: "",
  rfc: "",
  celular: "",
  curp: "",
  razon_social: "",
  regimen_fiscal: "",
  cfdi: "",
  colonia: "",
  codigo_postal: "",
  calle: "",
  num_exterior: "",
  num_interior: "",
  ciudad: "",
  localidad: "",
  estado: "",
  pais: "",
  tipo_servicio_paquete: "",
  ip_address: "",
  tipo_servicio: "",
  id_mikrotik: "",
  listado_region: "",
};

const dataInput = [
  { name: "nombre", required: true, placeholder: "Nombre", type: "text", section: "personales" },
  { name: "apellido", required: true, placeholder: "Apellido", type: "text", section: "personales" },
  { name: "email", required: true, placeholder: "Correo", type: "email", section: "personales" },
  { name: "celular", required: false, placeholder: "Celular", type: "tel", section: "personales" },
  { name: "calle", required: false, placeholder: "Calle", type: "text", section: "direccion" },
  { name: "colonia", required: false, placeholder: "Colonia", type: "text", section: "direccion" },
  { name: "codigo_postal", required: false, placeholder: "Código Postal", type: "text", section: "direccion" },
  { name: "num_exterior", required: false, placeholder: "Num. Exterior", type: "text", section: "direccion" },
  { name: "num_interior", required: false, placeholder: "Num. Interior", type: "text", section: "direccion" },
  { name: "ciudad", required: false, placeholder: "Ciudad", type: "text", section: "direccion" },
  { name: "localidad", required: false, placeholder: "Localidad", type: "text", section: "direccion" },
  { name: "estado", required: false, placeholder: "Estado", type: "text", section: "direccion" },
  { name: "pais", required: false, placeholder: "País", type: "text", section: "direccion" },
  { name: "rfc", required: false, placeholder: "R.F.C", type: "text", section: "fiscales" },
  { name: "curp", required: false, placeholder: "CURP", type: "text", section: "fiscales" },
  { name: "razon_social", required: false, placeholder: "Razón Social", type: "text", section: "fiscales" },
  { name: "regimen_fiscal", required: false, placeholder: "Régimen Fiscal", type: "text", section: "fiscales" },
  { name: "cfdi", required: false, placeholder: "Uso CFDI", type: "text", section: "fiscales" },
  { name: "tipo_servicio_paquete", required: false, placeholder: "Paquete", type: "text", section: "servicio" },
  { name: "ip_address", required: false, placeholder: "IP", type: "text", section: "servicio" },
  { name: "id_mikrotik", required: false, placeholder: "Mrikotik", type: "text", section: "servicio" },
  { name: "listado_region", required: false, placeholder: "listado region", type: "text", section: "servicio" },
];

function generateTempPassword(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return `tmp${Date.now().toString(36)}`;
}

export const CreateCustomer: FC<CreateCustomerProps> = ({ open, onOpenChange }) => {
  const [dataUser, setDataUser] = useState(initialUserData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isFormComplete = useMemo(
    () => !hasFieldErrors(validateCustomerForm(dataUser)),
    [dataUser]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDataUser((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "email" ? { username: value } : {}),
    }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDataUser(initialUserData);
      setErrors({});
      setIsLoading(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const validationErrors = validateCustomerForm(dataUser);
      if (hasFieldErrors(validationErrors)) {
        setErrors(validationErrors);
        toast({
          title: "Formulario incompleto",
          description: firstFieldErrorMessage(validationErrors),
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const tempPassword = generateTempPassword();
      const payload = {
        ...dataUser,
        password: tempPassword,
        confirmed: true,
        blocked: false,
        estatus_servicio: true,
        role: "2",
      };

      try {
        await businessApi.post("/auth/local/register", payload);
        toast({
          title: "Cliente creado",
          description: `El cliente se registró correctamente. Contraseña temporal: ${tempPassword}`,
        });
        setDataUser(initialUserData);
        setErrors({});
        onOpenChange(false);
      } catch (error) {
        console.error("Error al crear usuario:", error);
        toast({
          title: "Error al crear cliente",
          description: handleApiError(error).message || "No se pudo crear el cliente",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dataUser, onOpenChange, toast]
  );

  const renderFields = (section: string) =>
    dataInput
      .filter((item) => item.section === section)
      .map((item) => (
        <div className="space-y-2" key={item.name}>
          <Label htmlFor={item.name}>
            {item.placeholder}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={item.name}
            name={item.name}
            placeholder={item.placeholder}
            type={item.type}
            value={dataUser[item.name as keyof typeof dataUser] ?? ""}
            onChange={handleChange}
            className={errors[item.name] ? "border-red-500" : ""}
            disabled={isLoading}
            aria-invalid={Boolean(errors[item.name])}
          />
          {errors[item.name] && (
            <p className="text-xs text-red-600">{errors[item.name]}</p>
          )}
        </div>
      ));

  return (
    <div className={s.container}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Complete la información obligatoria para registrar un nuevo cliente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate>
            <Tabs defaultValue="personales" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="personales">Datos Personales</TabsTrigger>
                <TabsTrigger value="direccion">Direccion</TabsTrigger>
                <TabsTrigger value="fiscales">Datos Fiscales</TabsTrigger>
                <TabsTrigger value="servicio">Servicio</TabsTrigger>
              </TabsList>

              <TabsContent value="personales" className="grid grid-cols-2 gap-4">
                {renderFields("personales")}
              </TabsContent>
              <TabsContent value="direccion" className="grid grid-cols-2 gap-4">
                {renderFields("direccion")}
              </TabsContent>
              <TabsContent value="fiscales" className="grid grid-cols-2 gap-4">
                {renderFields("fiscales")}
              </TabsContent>
              <TabsContent value="servicio" className="grid grid-cols-2 gap-4">
                {renderFields("servicio")}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !isFormComplete}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

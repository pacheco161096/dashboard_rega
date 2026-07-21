"use client";

import { FC, useState, useCallback, useMemo } from "react";
import s from "./CustomerForm.module.css";
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
import { User } from "@/app/dashboard/customers/page";
import {
  firstFieldErrorMessage,
  hasFieldErrors,
  validateCustomerForm,
  type FieldErrors,
} from "@/lib/utils/formValidation";

export interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  userData?: User[] | null; // Datos del usuario a editar
  userId?: string | number; // ID del usuario a editar
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
  // Datos Personales
  {
    name: "nombre",
    required: true,
    placeholder: "Nombre",
    type: "text",
    section: "personales",
  },
  {
    name: "apellido",
    required: true,
    placeholder: "Apellido",
    type: "text",
    section: "personales",
  },
  {
    name: "email",
    required: true,
    placeholder: "Correo",
    type: "email",
    section: "personales",
  },
  {
    name: "celular",
    required: false,
    placeholder: "Celular",
    type: "tel",
    section: "personales",
  },
  {
    name: "calle",
    required: false,
    placeholder: "Calle",
    type: "text",
    section: "direccion",
  },
  {
    name: "colonia",
    required: false,
    placeholder: "Colonia",
    type: "text",
    section: "direccion",
  },
  {
    name: "codigo_postal",
    required: false,
    placeholder: "Código Postal",
    type: "text",
    section: "direccion",
  },
  {
    name: "num_exterior",
    required: false,
    placeholder: "Num. Exterior",
    type: "text",
    section: "direccion",
  },
  {
    name: "num_interior",
    required: false,
    placeholder: "Num. Interior",
    type: "text",
    section: "direccion",
  },
  {
    name: "ciudad",
    required: false,
    placeholder: "Ciudad",
    type: "text",
    section: "direccion",
  },
  {
    name: "localidad",
    required: false,
    placeholder: "Localidad",
    type: "text",
    section: "direccion",
  },
  {
    name: "estado",
    required: false,
    placeholder: "Estado",
    type: "text",
    section: "direccion",
  },
  {
    name: "pais",
    required: false,
    placeholder: "País",
    type: "text",
    section: "direccion",
  },

  // Datos Fiscales
  {
    name: "rfc",
    required: false,
    placeholder: "R.F.C",
    type: "text",
    section: "fiscales",
  },
  {
    name: "curp",
    required: false,
    placeholder: "CURP",
    type: "text",
    section: "fiscales",
  },
  {
    name: "razon_social",
    required: false,
    placeholder: "Razón Social",
    type: "text",
    section: "fiscales",
  },
  {
    name: "regimen_fiscal",
    required: false,
    placeholder: "Régimen Fiscal",
    type: "text",
    section: "fiscales",
  },
  {
    name: "cfdi",
    required: false,
    placeholder: "Uso CFDI",
    type: "text",
    section: "fiscales",
  },

  // Servicio
  {
    name: "tipo_servicio_paquete",
    required: false,
    placeholder: "Paquete",
    type: "text",
    section: "servicio",
  },
  {
    name: "ip_address",
    required: false,
    placeholder: "IP",
    type: "text",
    section: "servicio",
  },
  {
    name: "id_mikrotik",
    required: false,
    placeholder: "Mrikotik",
    type: "text",
    section: "servicio",
  },
  {
    name: "listado_region",
    required: false,
    placeholder: "listado region",
    type: "text",
    section: "servicio",
  },
];

function generateTempPassword(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return `tmp${Date.now().toString(36)}`;
}

export const CustomerForm: FC<CustomerFormProps> = ({
  open,
  onOpenChange,
  mode = "create",
  userData = null,
  userId,
}) => {
  const [dataUser, setDataUser] = useState<Record<string, string>>(() => {
    if (userData && Array.isArray(userData) && userData.length > 0) {
      // Convertir todos los valores null/undefined a cadenas vacías
      const userDataRaw = userData[0] as unknown as Record<
        string,
        string | null | undefined
      >;
      const sanitizedData: Record<string, string> = {};
      Object.keys(initialUserData).forEach((key) => {
        sanitizedData[key] = userDataRaw[key] ?? "";
      });
      return sanitizedData;
    }
    return initialUserData;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
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

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setIsLoading(false);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

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

      try {
        if (mode === "create") {
          const tempPassword = generateTempPassword();
          const payload = {
            ...dataUser,
            password: tempPassword,
            confirmed: true,
            blocked: false,
            estatus_servicio: true,
            role: "2",
          };

          await businessApi.post("/auth/local/register", payload);
          toast({
            title: "Cliente creado",
            description: `El cliente se registró correctamente. Contraseña temporal: ${tempPassword}`,
          });
        } else {
          const requiredFields = ["nombre", "apellido", "email", "username"];
          const optionalFields = [
            "celular",
            "calle",
            "colonia",
            "codigo_postal",
            "num_exterior",
            "num_interior",
            "ciudad",
            "localidad",
            "estado",
            "pais",
            "rfc",
            "curp",
            "razon_social",
            "regimen_fiscal",
            "cfdi",
            "tipo_servicio_paquete",
            "ip_address",
            "id_mikrotik",
            "listado_region",
          ];

          const payload: Record<string, string> = {};

          requiredFields.forEach((field) => {
            const value = dataUser[field];
            if (value !== undefined && value !== null) {
              payload[field] = value;
            }
          });

          optionalFields.forEach((field) => {
            const value = dataUser[field];
            if (value !== undefined && value !== null && value !== "") {
              payload[field] = value;
            }
          });

          await businessApi.put(`/users/${userId}`, payload);
          toast({
            title: "Cliente actualizado",
            description: "Los datos se guardaron correctamente",
          });
        }

        setErrors({});
        onOpenChange(false);
      } catch (error) {
        toast({
          title: mode === "create" ? "Error al crear cliente" : "Error al actualizar cliente",
          description:
            handleApiError(error).message ||
            `No se pudo ${mode === "create" ? "crear" : "actualizar"} el cliente`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dataUser, onOpenChange, mode, userId, toast]
  );

  const renderFields = (section: string) =>
    dataInput.flatMap((item) => {
      if (item.section !== section) return [];

      const fieldValue = dataUser[item.name as keyof typeof dataUser];
      const safeValue = fieldValue ?? "";
      return [
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
            value={safeValue as string}
            onChange={handleChange}
            className={errors[item.name] ? "border-red-500" : ""}
            disabled={isLoading}
            aria-invalid={Boolean(errors[item.name])}
          />
          {errors[item.name] && (
            <p className="text-xs text-red-600">{errors[item.name]}</p>
          )}
        </div>,
      ];
    });

  return (
    <div className={s.container}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Nuevo Cliente" : "Editar Cliente"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Complete la información para registrar un nuevo cliente."
                : "Modifique la información del cliente."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate>
            <Tabs defaultValue="personales" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="personales">Datos Personales</TabsTrigger>
                <TabsTrigger value="direccion">Dirección</TabsTrigger>
                <TabsTrigger value="fiscales">Datos Fiscales</TabsTrigger>
                <TabsTrigger value="servicio">Servicio</TabsTrigger>
              </TabsList>

              <TabsContent
                value="personales"
                className="grid grid-cols-2 gap-4"
              >
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
                {isLoading
                  ? "Procesando..."
                  : mode === "create"
                  ? "Guardar"
                  : "Actualizar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

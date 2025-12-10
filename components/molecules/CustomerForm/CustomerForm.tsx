"use client";

import { FC, useState, useCallback, useEffect } from "react";
import s from "./CustomerForm.module.css";
import { Button } from "@/components/ui/button";
import axios from "axios";
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

export const CustomerForm: FC<CustomerFormProps> = ({
  open,
  onOpenChange,
  mode = "create",
  userData = null,
  userId,
}) => {
  const [dataUser, setDataUser] = useState<Record<string, string>>(
    userData && Array.isArray(userData) && userData.length > 0
      ? (userData[0] as unknown as Record<string, string>)
      : initialUserData
  );
  const [isLoading, setIsLoading] = useState(false);
  // Cargar datos del usuario cuando estamos en modo edición
  useEffect(() => {
    if (
      mode === "edit" &&
      userData &&
      Array.isArray(userData) &&
      userData.length > 0
    ) {
      setDataUser(userData[0] as unknown as Record<string, string>);
    } else {
      setDataUser(initialUserData);
    }
  }, [mode, userData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDataUser((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "email" ? { username: value } : {}),
    }));
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsLoading(true);

      try {
        if (mode === "create") {
          // Crear nuevo usuario
          const payload = {
            ...dataUser,
            password: "123456789",
            confirmed: true,
            blocked: false,
            estatus_servicio: true,
            role: "2",
          };

          await axios.post(
            "https://monkfish-app-2et8k.ondigitalocean.app/api/auth/local/register",
            payload
          );
        } else {
          // Actualizar usuario existente
          // Campos requeridos que siempre deben incluirse
          const requiredFields = ["nombre", "apellido", "email", "username"];

          // Campos opcionales editables
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

          // Construir el payload
          const payload: Record<string, string> = {};

          // Incluir campos requeridos (siempre, incluso si están vacíos)
          requiredFields.forEach((field) => {
            const value = dataUser[field];
            if (value !== undefined && value !== null) {
              payload[field] = value;
            }
          });

          // Incluir campos opcionales solo si tienen valor
          optionalFields.forEach((field) => {
            const value = dataUser[field];
            if (value !== undefined && value !== null && value !== "") {
              payload[field] = value;
            }
          });
          await axios.put(
            `https://monkfish-app-2et8k.ondigitalocean.app/api/users/${userId}`,
            payload
          );
        }

        onOpenChange(false);
      } catch (error) {
        console.error(
          `Error al ${mode === "create" ? "crear" : "actualizar"} usuario:`,
          error
        );
      } finally {
        setIsLoading(false);
      }
    },
    [dataUser, onOpenChange, mode, userId]
  );

  const renderFields = (section: string) =>
    dataInput
      .filter((item) => item.section === section)
      .map((item) => (
        <div className="space-y-2" key={item.name}>
          <Label htmlFor={item.name}>{item.placeholder}</Label>
          <Input
            id={item.name}
            name={item.name}
            placeholder={item.placeholder}
            type={item.type}
            value={dataUser[item.name as keyof typeof dataUser] as string}
            onChange={handleChange}
            required={item.required}
          />
        </div>
      ));

  return (
    <div className={s.container}>
      <Dialog open={open} onOpenChange={onOpenChange}>
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

          <form onSubmit={handleSubmit}>
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
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
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

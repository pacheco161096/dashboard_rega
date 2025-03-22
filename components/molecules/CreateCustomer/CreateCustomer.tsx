"use client";

import { FC, useState, useCallback } from "react";
import s from "./CreateCustomer.module.css";
import { Input } from "@/components/atoms/Input/Input";
import axios from "axios";

export interface CreateCustomerProps {
  handleModal: () => void;
}

export const CreateCustomer: FC<CreateCustomerProps> = ({ handleModal }) => {
  const [dataUser, setdataUser] = useState({
    password: "123456789",
    confirmed: true,
    blocked: false,
    estatus_servicio: true,
    username: "",
  });

  const handleInput = useCallback((name: string, value: string) => {
    setdataUser((prev) => ({
      ...prev,
      [name]: value,
      username: name === "email" ? value : prev.username,
    }));
  }, []);

  const postData = async (url: string, data: object) => {
    try {
      const response = await axios.post(url, data);
      console.log("Usuario creado:", response.data);
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      await postData(
        "https://monkfish-app-2et8k.ondigitalocean.app/api/auth/local/register",
        dataUser
      );
      handleModal();
    },
    [dataUser, handleModal]
  );

  const dataInput = [
    // Datos Personales
    { name: "nombre", required: true, placeHolder: "Nombre", type: "text" },
    { name: "apellido", required: true, placeHolder: "Apellido", type: "text" },
    { name: "email", required: true, placeHolder: "Correo", type: "email" },
    { name: "celular", required: false, placeHolder: "Celular", type: "tel" },
  
    // Datos Fiscales
    { name: "rfc", required: false, placeHolder: "R.F.C", type: "text" },
    { name: "curp", required: false, placeHolder: "CURP", type: "text" },
    { name: "razon_social", required: false, placeHolder: "Razón Social", type: "text" },
    { name: "regimen_fiscal", required: false, placeHolder: "Régimen Fiscal", type: "text" },
    { name: "cfdi", required: false, placeHolder: "Uso CFDI", type: "text" },
  
    // Dirección
    { name: "calle", required: false, placeHolder: "Calle", type: "text" },
    { name: "colonia", required: false, placeHolder: "Colonia", type: "text" },
    { name: "codigo_postal", required: false, placeHolder: "Código Postal", type: "text" },
    { name: "num_exterior", required: false, placeHolder: "Num. Exterior", type: "text" },
    { name: "num_interior", required: false, placeHolder: "Num. Interior", type: "text" },
    { name: "ciudad", required: false, placeHolder: "Ciudad", type: "text" },
    { name: "localidad", required: false, placeHolder: "Localidad", type: "text" },
    { name: "estado", required: false, placeHolder: "Estado", type: "text" },
    { name: "pais", required: false, placeHolder: "País", type: "text" },
  
    // Servicio
    { name: "tipo_servicio_paquete", required: false, placeHolder: "Paquete", type: "text" },
  ];
  
  return (
    <div className={s.container}>
      <form className="w-full p-5 flex flex-col items-center" onSubmit={handleSubmit}>
        <h2 className="text-3xl mb-5 text-center">Información de usuario</h2>
        <div className="grid grid-cols-2 gap-4 w-full">
          {dataInput.map((item) => (
            <Input
              key={item.name}
              name={item.name}
              funcion={handleInput}
              required={item.required}
              placeHolder={item.placeHolder}
              type={item.type}
            />
          ))}
        </div>
        <input
          type="submit"
          value="Guardar"
          className="rounded-md bg-blue-600 text-white p-2 w-48 mt-5 cursor-pointer"
        />
      </form>
    </div>
  );
};

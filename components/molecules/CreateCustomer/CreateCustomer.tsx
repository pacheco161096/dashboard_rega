"use client";

import { FC, useCallback, useState } from "react";

import s from "./CreateCustomer.module.css";

import { Input } from "@/components/atoms/Input/Input";

import axios from "axios";

export interface CreateCustomerProps {
  data?: [];
  handleModal: () => void;
}

export const CreateCustomer: FC<CreateCustomerProps> = (props) => {
  const { handleModal } = props;

  const [dataUser, setdataUser] = useState({
    password: "123456789",
    confirmed: true,
    blocked: false,
    estatus_servicio: true,
    username: "",
  });

  const handleInput = (
    name: string | boolean | number | symbol | any,
    value: string | boolean | number | symbol | any
  ) => {
    if (name === "email") {
      setdataUser((dataUser.username = value));
    }
    setdataUser({ ...dataUser, [name]: value });
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    UsePostData(
      "https://monkfish-app-2et8k.ondigitalocean.app/api/auth/local/register",
      dataUser
    );
    handleModal();
  };

  const dataInput = [
    {
      name: "nombre",
      requerid: true,
      placeHolder: "Nombre",
      type: "text",
    },
    {
      name: "apellido",
      requerid: true,
      placeHolder: "Apellido",
      type: "text",
    },
    {
      name: "email",
      requerid: true,
      placeHolder: "Correo",
      type: "email",
    },
    {
      name: "celular",
      requerid: false,
      placeHolder: "Celular",
      type: "phone",
    },
    {
      name: "rfc",
      requerid: false,
      placeHolder: "R.F.C",
      type: "text",
    },
    {
      name: "curp",
      requerid: false,
      placeHolder: "CURP",
      type: "text",
    },
    {
      name: "razon_social",
      requerid: false,
      placeHolder: "Razon Social",
      type: "text",
    },
    {
      name: "regimen_fiscal",
      requerid: false,
      placeHolder: "Regimen Fiscal",
      type: "text",
    },
    {
      name: "cfdi",
      requerid: false,
      placeHolder: "Uso CFDI",
      type: "text",
    },
    {
      name: "calle",
      requerid: false,
      placeHolder: "Calle",
      type: "text",
    },
    {
      name: "colonia",
      requerid: false,
      placeHolder: "Colonia",
      type: "text",
    },
    {
      name: "codigo_postal",
      requerid: false,
      placeHolder: "Codigo Postal",
      type: "text",
    },
    {
      name: "num_exterior",
      requerid: false,
      placeHolder: "Num. Exterior",
      type: "text",
    },
    {
      name: "num_interior",
      requerid: false,
      placeHolder: "Num. Interior",
      type: "text",
    },
    {
      name: "ciudad",
      requerid: false,
      placeHolder: "Ciudad",
      type: "text",
    },
    {
      name: "localidad",
      requerid: false,
      placeHolder: "Localidad",
      type: "text",
    },
    {
      name: "estado",
      requerid: false,
      placeHolder: "Estado",
      type: "text",
    },
    {
      name: "pais",
      requerid: false,
      placeHolder: "Pais",
      type: "text",
    },
    {
      name: "tipo_servicio_paquete",
      requerid: false,
      placeHolder: "Paquete",
      type: "text",
    },
  ];

  const UsePostData = async (url: string, data: []) => {
    try {
      const response = await axios.post(url, data);
      console.log(response.data); // Procesar la respuesta exitosa
    } catch (error) {
      console.error(error); // Manejar el error
    }
  };

  return (
    <div className={s.container}>
      <form
        action=""
        className="w-full p-5 flex flex-col items-center"
        onSubmit={handleSubmit}
      >
        <h2 className=" text-3xl mb-5 text-center">Informacion de usuario</h2>
        <div className=" grid grid-cols-2 gap-4 w-full">
          {dataInput?.map((item, i) => (
            <Input
              key={i}
              nombre={item.name}
              funcion={handleInput}
              valor={dataUser[i]}
              requerido={item.requerid}
              placeHolder={item.placeHolder}
              type={item.type}
            />
          ))}
        </div>
        <input
          type="submit"
          value="Guardar"
          className=" rounded-md bg-blue-600 text-white p-2 w-48 mt-5"
        />
      </form>
    </div>
  );
};

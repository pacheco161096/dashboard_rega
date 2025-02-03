"use client";

import { FC, useCallback, useState } from "react";

import s from "./RegisterPay.module.css";

import { Input } from "@/components/atoms/Input/Input";

import axios from "axios";

export interface RegisterPayProps {
  selectedUser: any[];
  handleModal: () => void;
}

/* 
export interface itemPay {
  id: string;
  typePay: string;
  totalPay: number;
}
*/

export const RegisterPay: FC<RegisterPayProps> = (props) => {
  const { handleModal, selectedUser } = props;

  const { Facturas }: any = selectedUser;
  
  const handleSubmit = (event: any) => {
    /* event.preventDefault();
    UsePostData(
      "https://monkfish-app-2et8k.ondigitalocean.app/api/auth/local/register",
      dataUser
    ); */
    handleModal();
  };

  const handleInput = (
    name: string | boolean | number | symbol | any,
    value: string | boolean | number | symbol | any
  ) => {
    /* if (name === "email") {
      setdataUser((dataUser.username = value));
    }
    setdataUser({ ...dataUser, [name]: value }); */
  };

  const dataInput = [
    {
      name: "name",
      requerid: true,
      placeHolder: "Nombre",
      type: "text",
      disableField: true
    },
    {
      name: "lastName",
      requerid: true,
      placeHolder: "Apellido",
      type: "text",
      disableField: true
    },
    {
      name: "typePackage",
      requerid: false,
      placeHolder: "Paquete",
      type: "text",
      disableField: true
    },
    {
      name: "contractNum",
      requerid: false,
      placeHolder: "No. Contrato",
      type: "text",
      disableField: true
    },
  ];
  /* Agregar tabla de facturas -Check y Fecha - Total con autoSuma */

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
        <h2 className="text-3xl mb-5 text-center">Registrar Pago</h2>
        <div className="grid grid-cols-2 gap-4 w-full">
          {dataInput?.map((item, i) => (
            <Input
              key={i}
              nombre={item.name}
              funcion={() => handleInput}
              valor={''}
              requerido={item.requerid}
              placeHolder={item.placeHolder}
              type={item.type}
              isEdited={item?.disableField || false}
            />
          ))}
        </div>
        <ul>
          {
            Facturas.map((factura, i) => (
              <li className="">
                <Input
                  funcion={ () => console.log('factura ', factura, i) }
                  key={ i }
                  nombre={ factura.fecha }
                  type="checkbox"
                  valor={ factura.pagado }
                  requerido={ false }
                />
              </li>
            ))
          }
        </ul>
        <input
          type="submit"
          value="Guardar"
          className=" rounded-md bg-blue-600 text-white p-2 w-48 mt-5"
        />
      </form>
    </div>
  );
};
"use client";

import { FC, useCallback, useState } from "react";
import s from "./UpdateCustomer.module.css";
import { Input } from "@/components/atoms/Input/Input";
import { User } from "@/app/dashboard/customers/page";

export interface UpdateCustomerProps {
  data: User[] | null;
}

export const UpdateCustomer: FC<UpdateCustomerProps> = ({ data }) => {

  const [userInformation, setUserInformation] = useState(
    () =>
      data
        ? [
            {
              name: "lastname",
              required: true,
              placeholder: data[0]?.apellido || "",
              label: "Apellido",
              type: "text",
              value: data[0]?.apellido || "",
              defaultValue: data[0]?.apellido || "",
              size: "half",
              errorMessageEmpty: "Ingrese Apellido",
            },
            {
              name: "name",
              required: true,
              placeholder: data[0]?.nombre || "",
              label: "Nombre",
              type: "text",
              value:data[0]?.nombre || "",
              defaultValue: data[0]?.nombre || "",
              size: "half",
              errorMessageEmpty: "Ingrese Nombre",
            },
            {
              name: "email",
              required: true,
              placeholder: data[0]?.email || "",
              label: "Correo Electrónico",
              type: "email",
              value: data[0]?.email || "",
              defaultValue:data[0]?.email || "",
              size: "half",
              errorMessageEmpty: "Ingrese Correo Electrónico",
            },
            {
              name: "celular",
              required: true,
              placeholder: data[0]?.celular || "",
              label: "Celular",
              type: "text",
              value: data[0]?.celular || "",
              defaultValue: data[0]?.celular || "",
              size: "half",
              errorMessageEmpty: "Ingrese celular",
            },
            {
              name: "calle",
              required: true,
              placeholder: data[0]?.calle || "",
              label: "Calle",
              type: "text",
              value: data[0]?.calle || "",
              defaultValue:data[0]?.calle || "",
              size: "half",
              errorMessageEmpty: "Ingrese calle",
            },
            {
              name: "cfdi",
              required: true,
              placeholder: data[0]?.cfdi || "",
              label: "CFDI",
              type: "text",
              value: data[0]?.cfdi || "",
              defaultValue:data[0]?.cfdi || "",
              size: "half",
              errorMessageEmpty: "Ingrese CFDI",
            },
            {
              name: "ciudad",
              required: true,
              placeholder: data[0]?.ciudad || "",
              label: "Ciudad",
              type: "text",
              value:data[0]?.ciudad || "",
              defaultValue:data[0]?.ciudad || "",
              size: "half",
              errorMessageEmpty: "Ingrese ciudad",
            },
          ]
        : []
  );

  const handleOnchange = useCallback((value: string, name: string) => {
    setUserInformation((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, value } : item
      )
    );
  }, []);

  return (
    <div className={s.container}>
      <h5 className={s.h5}>Actualizar Usuario</h5>
      <form action="" className={s.form}>
        {userInformation.map((item, index) => (
          <Input
            key={index}
            value={item.value}
            required={item.required}
            name={item.name}
            placeHolder={item.placeholder}
            type={item.type}
            label={item.label}
            size={item.size}
            funcion={handleOnchange}
          />
        ))}
      </form>
    </div>
  );
};

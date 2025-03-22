"use client";

import { FC,useEffect, useState } from "react";

import s from "./RegisterPay.module.css";

import { Input } from "@/components/atoms/Input/Input";

import axios from "axios";

import { User } from "@/app/dashboard/customers/page"

export interface RegisterPayProps {
  selectedUser:  User[] | undefined;
  handleModal: () => void;
}

interface Factura {
  id: string;
  fecha: string;
  pagado: boolean;
  total: number; // Agregar a las facturas esta propiedad
}

export const RegisterPay: FC<RegisterPayProps> = (props) => {
  const { handleModal, selectedUser } = props;
  const { Facturas }: any = selectedUser;

  const [checkedFacturas, setCheckedFacturas]: any = useState({});
  const [facturasToPay, setFacturasToPay] = useState([]);
  const [totalToPay, setTotalToPay] = useState(0);

  console.log("selectUser:", selectedUser);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log("Facturas a pagar:", facturasToPay);
    console.log("Total a pagar:", totalToPay);
    handleModal();
  };

  const handleInput = (
    name: string | boolean | number | symbol | any,
    value: string | boolean | number | symbol | any
  ) => {
  };

  const dataInput = [
    {
      name: selectedUser?.nombre,
      requerid: true,
      placeHolder: "Nombre",
      type: "text",
      disableField: true,
    },
    {
      name: selectedUser?.apellido,
      requerid: true,
      placeHolder: "Apellido",
      type: "text",
      disableField: true,
    },
    {
      name: selectedUser?.tipo_servicio_paquete,
      requerid: false,
      placeHolder: "Paquete",
      type: "text",
      disableField: true,
    },
    {
      name: selectedUser?.id,
      requerid: false,
      placeHolder: "No. Contrato",
      type: "text",
      disableField: true,
    },
  ];

  const handleCheckboxChange = (factura: any) => {
    setCheckedFacturas({
      ...checkedFacturas,
      [factura.id]: !checkedFacturas[factura.id],
    });
  };

  useEffect(() => {
    const selected: any = Object.keys(checkedFacturas)
      .filter((key) => checkedFacturas[key])
      .map((key) => Facturas.find((f:any) => f.id === key));

    setFacturasToPay(selected.filter(Boolean));
  }, [checkedFacturas, Facturas]);

  useEffect(() => {
    const newTotal = facturasToPay.reduce((sum, factura) => sum + factura.total, 0); // Que factura tenga el total en el objeto
    setTotalToPay(newTotal);
  }, [facturasToPay]);


  return (
    <div className={s.container}>
      <form
        action=""
        className={`${ s.form } w-full p-5 flex flex-col items-center`}
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl mb-5 text-center">Registrar Pago</h2>
        <div className="grid grid-cols-2 gap-4 w-full">
          {dataInput?.map((item, i) => (
            <Input
              key={i}
              nombre={item.name}
              funcion={() => handleInput}
              valor={item?.name || ""}
              requerido={item.requerid}
              placeHolder={item.placeHolder}
              type={item.type}
              isEdited={item?.disableField || false}
            />
          ))}
        </div>
        <h3>Facturas</h3>
        <ul>
          {Facturas.map((factura: any) => (
            <li className="mt-2 mb-3" key={factura.id}>
              <Input
                checked={checkedFacturas[factura.id] || false}
                funcion={() => handleCheckboxChange(factura)}
                nombre={factura.fecha}
                requerido={false}
                type="checkbox"
                valor={factura.pagado}
              />
            </li>
          ))}
        </ul>
        <b><p>Total a pagar: { totalToPay }</p></b>
        <input
          type="submit"
          value="Pagar"
          className={`${ s.button } rounded-md bg-blue-600 text-white p-2 w-48`}
        />
      </form>
    </div>
  );
};
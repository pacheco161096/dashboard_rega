"use client";

import { FC, useEffect, useState, FormEvent, useMemo } from "react";

import s from "./RegisterPay.module.css";

import { Input } from "@/components/atoms/Input/Input";

import { User, Factura } from "@/app/dashboard/customers/page"

export interface RegisterPayProps {
  selectedUser: User[] | undefined;
  handleModal: () => void;
}

export const RegisterPay: FC<RegisterPayProps> = (props) => {
  const { handleModal, selectedUser } = props;
  const user = selectedUser?.[0];
  const facturas = useMemo(() => user?.Facturas ?? [], [user?.Facturas]);

  const [checkedFacturas, setCheckedFacturas] = useState<Record<string, boolean>>({});
  const [facturasToPay, setFacturasToPay] = useState<Factura[]>([]);
  const [totalToPay, setTotalToPay] = useState(0);

  console.log("selectUser:", selectedUser);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Facturas a pagar:", facturasToPay);
    console.log("Total a pagar:", totalToPay);
    handleModal();
  };

  const handleInput = () => {
  };

  const dataInput = [
    {
      name: user?.nombre,
      requerid: true,
      placeHolder: "Nombre",
      type: "text",
      disableField: true,
    },
    {
      name: user?.apellido,
      requerid: true,
      placeHolder: "Apellido",
      type: "text",
      disableField: true,
    },
    {
      name: user?.tipo_servicio_paquete,
      requerid: false,
      placeHolder: "Paquete",
      type: "text",
      disableField: true,
    },
    {
      name: user?.id?.toString(),
      requerid: false,
      placeHolder: "No. Contrato",
      type: "text",
      disableField: true,
    },
  ];

  const handleCheckboxChange = (factura: Factura) => {
    const facturaId = factura.id.toString();
    setCheckedFacturas({
      ...checkedFacturas,
      [facturaId]: !checkedFacturas[facturaId],
    });
  };

  useEffect(() => {
    const selected = Object.keys(checkedFacturas)
      .filter((key) => checkedFacturas[key])
      .map((key) => facturas.find((f) => f.id.toString() === key))
      .filter((f): f is Factura => f !== undefined);

    setFacturasToPay(selected);
  }, [checkedFacturas, facturas]);

  useEffect(() => {
    const newTotal = facturasToPay.reduce((sum, factura) => sum + factura.precio, 0);
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
              name={item.placeHolder}
              funcion={handleInput}
              value={item?.name?.toString() || ""}
              required={item.requerid}
              placeHolder={item.placeHolder}
              type={item.type}
              isEdited={item?.disableField || false}
            />
          ))}
        </div>
        <h3>Facturas</h3>
        <ul>
          {facturas.map((factura) => (
            <li className="mt-2 mb-3" key={factura.id}>
              <Input
                checked={checkedFacturas[factura.id.toString()] || false}
                funcion={() => handleCheckboxChange(factura)}
                name={factura.fecha}
                required={false}
                type="checkbox"
                value={factura.pagado.toString()}
                placeHolder={factura.fecha}
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

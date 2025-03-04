"use client";
import React, { useEffect, useState } from "react";
import s from "./cobranza.module.css";
import Drawer from "@mui/material/Drawer";
import { User } from "../customers/page";

function Cobranza() {
  const [openVenta, setOpenVenta] = useState(false);
  const [openGasto, setOpenGasto] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const selectedUser = sessionStorage.getItem("selectedUser");
    if (selectedUser) {
      const parsedUser = JSON.parse(selectedUser);
      
      if (Array.isArray(parsedUser) && parsedUser.length > 0) {
        setUser(parsedUser[0]);
        setOpenVenta(true);
      }
      // sessionStorage.removeItem("selectedUser"); // TODO: Limpiar dato después de usarlo
    }
  }, []);

  console.log('*** user ', user);

  return (
    <div className={s.Cobranza}>
      {/* Header */}
      <div className={s["Cobranza-header"]}>
        <div className={s["Cobranza-cashInit"]}>
          <h1 className="text-xl font-semibold">
            Cobranza
          </h1>
          <div className={s["Cobranza-search"]}>
            <input
              type="text"
              placeholder="Buscar producto"
              className="outline-1 px-2 py-1 bg-transparent ml-2 w-full"
            />
          </div>
          <button className="bg-gray-500 text-white px-2 py-1 rounded-md">
            🏦 Abrir caja
          </button>
        </div>
        <div className={s["Cobranza-actions"]}>
          <button
            className="bg-green-600 text-white px-2 py-1 rounded-md"
            onClick={() => setOpenVenta(true)}
          >
            ✅ Nueva venta
          </button>
          <button
            className="bg-red-600 text-white px-2 py-1 rounded-md"
            onClick={() => setOpenGasto(true)}
          >
            ❌ Nuevo gasto
          </button>
        </div>
      </div>
      {/* Container */}
      <div className={s["Cobranza-container"]}>
        {/* Sección de productos */}
        <div className={s["Cobranza-products"]}>
          <button className="border border-black rounded-lg flex flex-col items-center justify-center p-6 h-60 w-40">
            <span className="text-xl">➕</span>
            <span className="text-md">
              Crear producto
            </span>
          </button>
        </div>
        {/* Sidebar */}
        <div className={s["Cobranza-sidebar"]}>
          <div className={s["Cobranza-titleSide"]}>
            <h2 className="text-lg font-semibold">
              Productos
            </h2>
            <a href="#" className="text-blue-500 text-sm underline">
              Vaciar canasta
            </a>
          </div>
          <div className={s["Cobranza-cart"]}>
            <span className="text-5xl">🛒</span>
            <span className="text-md font-semibold">
              No hay conceptos
            </span>
          </div>
          <div className={s["Cobranza-footer"]}>
            <span>0</span>
            <span>
              Continuar
            </span>
            <span className="font-bold">$0</span>
          </div>
        </div>
      </div>

      {/* Drawer Nueva Venta */}
      <Drawer anchor="right" open={openVenta} onClose={() => setOpenVenta(false)}>
        <div className="w-96 p-4">
          <form>
            <h2 className="text-lg font-bold">
              Crear Venta
            </h2>
            <label className="block mt-4">
              Fecha de la venta*
            </label>
            <input type="date" className="w-full border p-2 rounded" />
            <label className="block mt-4">
              Cliente*
            </label>
            <input type="text" className="w-full border p-2 rounded" value={ user ? `${user.nombre} ${user.apellido}` : ''} />
            <label className="block mt-4">
              Monto*
            </label>
            <input type="number" className="w-full border p-2 rounded" />
            <button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded w-full">
              Crear Venta
            </button>
            <button className="bg-red-500 text-white px-4 py-2 mt-4 rounded w-full" onClick={() => setOpenVenta(false)}>
              Cancelar
            </button>
          </form>
        </div>
      </Drawer>

      {/* Drawer Nuevo Gasto */}
      <Drawer anchor="right" open={openGasto} onClose={() => setOpenGasto(false)}>
        <div className="w-96 p-4">
          <form>
            <h2 className="text-lg font-bold">
              Nuevo Gasto
            </h2>
            <label className="block mt-2">
              Fecha del gasto*
            </label>
            <input type="date" className="w-full border p-2 rounded" />
            <label className="block mt-2">
              Categoría del gasto*
            </label>
            <select className="w-full border p-2 rounded">
              <option>Selecciona una categoría</option>
            </select>
            <label className="block mt-2">
              Monto*
            </label>
            <input type="number" className="w-full border p-2 rounded" />
            <button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded w-full">
              Crear Gasto
            </button>
            <button className="bg-red-500 text-white px-4 py-2 mt-4 rounded w-full" onClick={() => setOpenGasto(false)}>
              Cancelar
            </button>
          </form>
        </div>
      </Drawer>
    </div>
  );
}

export default Cobranza;
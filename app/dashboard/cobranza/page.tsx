"use client";
import React, { useEffect, useRef, useState } from "react";
import s from "./cobranza.module.css";
import Drawer from "@mui/material/Drawer";
import { Factura, User } from "../customers/page";
import axios from 'axios';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ItemCarInt {
  idfactura: string;
  id: number;
  titulo: string;
  precio: number;
  cantidad: number;
  type: string;
  fecha: string;
}

function Cobranza() {
  const [openVenta, setOpenVenta] = useState(false);
  const [openGasto, setOpenGasto] = useState(false);
  const [tab, setTabNew] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<any | null>(null);
  const [carShop, setCarShop] = useState<ItemCarInt[]>([])
  const [facturasAgregadas, setFacturasAgregadas] = useState<number[]>([]);
  const [currentDate, setCurrentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [isOpenCaja, setIsOpenCaja] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [montoApertura, setMontoApertura] = useState("");
  const [montoCierre, setMontoCierre] = useState("");
  const [caja, setCaja] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasShownAlert = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    const employee = sessionStorage.getItem("loginUser");
    const storedCaja = sessionStorage.getItem("caja");

    if (employee) {
      const parsedEmp = JSON.parse(employee);
      setEmployee(parsedEmp);
    }

    if (!storedCaja && !hasShownAlert.current) {
      alert('La caja aún no está abierta');
      hasShownAlert.current = true;
    }
  }, []);

  useEffect(() => {
    const storedCaja = sessionStorage.getItem("caja");
    const selectedUser = sessionStorage.getItem("selectedUser");

    if (storedCaja) {
      const parsedCaja = JSON.parse(storedCaja);
      setCaja(parsedCaja);
      setIsOpenCaja(true);
    } else {
      setIsOpenCaja(false);
    }

    if (selectedUser && isOpenCaja) {
      const parsedUser = JSON.parse(selectedUser);
      if (Array.isArray(parsedUser) && parsedUser.length > 0) {
        setUser(parsedUser[0]);
        setOpenVenta(true);
        setTabNew(2);
        fetchDataUser(parsedUser[0]?.id);
      }
    }

    const today = new Date().toISOString().split("T")[0];
    setCurrentDate(today);
  }, [isOpenCaja, isDialogOpen]);

  const fetchDataUser = async (userId: string) => {
    if (carShop.length > 0) {
      setCarShop([]);
    }

    try {
      const response = await axios.post('https://monkfish-app-2et8k.ondigitalocean.app/api/searchUserPayment',
        {
          idusuario: userId
        });
      setUser(response.data);
    } catch (err) {
      console.log('error' + err)
    } finally {
    }
  };

  const addCarShop = (item: ItemCarInt) => {
    setCarShop((prevCarShop) => {
      // Verificar si el producto ya está en el carrito
      const existingItem = prevCarShop.find((product) => product.id === item.id);
  
      if (existingItem) {
        // Si el producto existe, incrementar la cantidad
        return prevCarShop.map((product) =>
          product.id === item.id ? { ...product, cantidad: product.cantidad + 1 } : product
        );
      } else {
        // Si el producto no existe, agregarlo al carrito conservando su cantidad inicial si ya la tiene
        return [...prevCarShop, { ...item, cantidad: item.cantidad || 1 }];
      }
    });
    setFacturasAgregadas(prevFacturas => [
      ...prevFacturas, 
      Number(item.idfactura) // Asegura que sea un número
    ]);
  };
  

  const incrementQuantity = (id: number) => {
    setCarShop((prevCarShop) =>
      prevCarShop.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  };

  const decrementQuantity = (id: number) => {
    setCarShop((prevCarShop) =>
      prevCarShop
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0) // Elimina si la cantidad llega a 0
    );
  };

  function openDrawerVenta() {
    setOpenVenta(true);
    setTabNew(1);
  }

  function closeDrawerVenta() {
    if (carShop.length > 0) {
      setCarShop([]);
    }

    setUser(null);
    sessionStorage.removeItem("selectedUser"); // Limpia user del storage
    setOpenVenta(false);
  }


  const SubmitVenta = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  }

  const totalPrecio = carShop.reduce((total, item) => {
    return total + (item.precio * item.cantidad);
  }, 0);

  const sendPay = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('https://monkfish-app-2et8k.ondigitalocean.app/api/payment',
      {
        idusuario: user?.id,
        carshop: carShop, 
        metodo: paymentMethod,
      });
      
      const { pagoexitoso, id } = response.data;

      if (pagoexitoso) {
        toast({
          title: "Pago exitoso",
          description: "Tu pago se ha procesado correctamente.",
        });
        fetchDataUser(id);
      }
      
    } catch (err) {
      console.log('error' + err)
    } finally {
      setIsLoading(false);
    }
  }

  const abrirCaja = () => {
    const now = new Date();
    const nuevaCaja = {
      montoApertura: parseFloat(montoApertura),
      fechaHoraApertura: now.toISOString(),
      employeeId: employee?.id,
    };
    sessionStorage.setItem("caja", JSON.stringify(nuevaCaja));
    setCaja(nuevaCaja);
    setMontoApertura("");
    setIsOpenCaja(true);
    setIsDialogOpen(false);
  };

  const cerrarCaja = async () => {
    if (!caja) return;

    const now = new Date();
    const cajaCerrada = {
      ...caja,
      montoCierre: parseFloat(montoCierre),
      fechaHoraCierre: now.toISOString(),
    };

    console.log('cajaCerrada ', cajaCerrada);

    try {
      /* await fetch("/api/caja/cerrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cajaCerrada),
      }); */
      sessionStorage.removeItem("caja");
      setCaja(null);
      setMontoCierre("");
      setIsOpenCaja(false);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error al cerrar caja:", err);
    }
  };

  return (
    <div className={s.Cobranza}>
      {/* Header */}
      <div className={s["Cobranza-header"]}>
        <div className={s["Cobranza-cashInit"]}>
          <h1 className="text-xl font-semibold text-white">
            Cobranza
          </h1>
          <div className={s["Cobranza-search"]}>
            <div className="w-[300px] h-10 border border-gray-900 rounded-lg flex p-2">
              <input type="number" pattern="[0-9]*" name='userId' required className="bg-transparent border-none outline-none w-[90%] h-full  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]" placeholder="Buscar Producto" />
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>
          <button className="bg-gray-500 text-white px-2 py-1 rounded-md" onClick={() => setIsDialogOpen(true)}>
            🏦 {!isOpenCaja ? 'Abrir caja' : 'Cerrar caja'}
          </button>
        </div>
        <div className={s["Cobranza-actions"]}>
          <button
            className={isOpenCaja ? s["Cobranza-buttonVenta"] : s["Cobranza-buttonDisVentaGast"]}
            onClick={() => openDrawerVenta()}
            disabled={ !isOpenCaja }
          >
            ✅ Nueva venta
          </button>
          <button
            className={isOpenCaja ? s["Cobranza-buttonGasto"] : s["Cobranza-buttonDisVentaGast"]}
            onClick={() => setOpenGasto(true)}
            disabled={ !isOpenCaja }
          >
            ❌ Nuevo gasto
          </button>
        </div>
      </div>
      {/* Container */}
      {
        !isOpenCaja && (
          <div className="flex h-full w-full">
            <div className="flex justify-center items-center text-center w-full">
              <span className="text-4xl">
                Caja cerrada. Ábrela para empezar a operar.
              </span>
            </div>
          </div>
        )
      }
      {
        isOpenCaja && (
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
              <h1 className="text-center font-semibold mb-3">
                Movimientos del {currentDate}
              </h1>
              <div className={s["Cobranza-titleSide"]}>
                <h3 className="font-semibold">
                  Ventas
                </h3>
              </div>
              <ul className={s["Cobranza-list"]}>
                <li>Concepto</li>
              </ul>
              <div className={s["Cobranza-titleSide"]}>
                <h3 className="font-semibold">
                  Gastos
                </h3>
              </div>
              <ul className={s["Cobranza-list"]}>
                <li>Concepto</li>
              </ul>
            </div>
          </div>
        )
      }
      {/* Dialog Abrir/Cerrar Caja */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isOpenCaja ? "Cierre de Caja" : "Apertura de Caja"}</DialogTitle>
            <DialogDescription>
              {isOpenCaja
                ? "Ingresa el monto final de cierre:"
                : "Ingresa el monto inicial de apertura:"}
            </DialogDescription>
          </DialogHeader>

          {!isOpenCaja ? (
            <Input
              type="number"
              placeholder="Ej. 1000"
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
            />
          ) : (
            <Input
              type="number"
              placeholder="Ej. 1500"
              value={montoCierre}
              onChange={(e) => setMontoCierre(e.target.value)}
            />
          )}

          <Button
            onClick={!isOpenCaja ? abrirCaja : cerrarCaja}
            disabled={(!isOpenCaja && !montoApertura) || (isOpenCaja && !montoCierre)}
          >
            {!isOpenCaja ? "Abrir Caja" : "Cerrar Caja"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Drawer Nueva Venta */}
      <Drawer anchor="right" open={openVenta} onClose={() => setOpenVenta(false)}>
        <div className="w-96 h-full p-4 bg-gray-800 outline outline-black/5  font-roboto text-white">
          <div>
            <h2 className="text-xl font-medium text-white">
              Crear Venta
            </h2>
            <div>
              <nav className="flex border-gray-900 border rounded-lg h-10 items-center justify-center relative">
                <div className={`w-1/2 text-center cursor-pointer relative border-r border-gray-900 ${tab == 1 ? 'text-white' : 'text-gray-400'}`} onClick={() => setTabNew(1)}>Producto</div>
                <div className={`w-1/2 text-center cursor-pointer relative ${tab != 1 ? 'text-white' : 'text-gray-400'}`} onClick={() => setTabNew(2)}>Paquete</div>
              </nav>
              <div>
                {tab === 1 ? <div>
                  <label className="block mt-4 text-gray-400 text-sm">
                    Buscar Producto
                  </label>
                  <div className="w-full h-10 border border-gray-900 rounded-lg flex p-2">
                    <input type="number" pattern="[0-9]*" className="bg-transparent border-none outline-none w-[90%] h-full  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]" />
                    <button>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                  : <div className="flex flex-col">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const userId = (e.currentTarget.userId as HTMLInputElement).value;
                      fetchDataUser(userId);
                    }}
                      className="mb-2"
                    >
                      <label className="block mt-4 text-gray-400 text-sm">
                        Buscar Cliente
                      </label>
                      <div className="w-full h-10 border border-gray-900 rounded-lg flex p-2">
                        <input type="number" pattern="[0-9]*" name='userId' required className="bg-transparent border-none outline-none w-[90%] h-full  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]" />
                        <button>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                          </svg>
                        </button>
                      </div>
                    </form>
                    {user && <div className="flex flex-col">
                      <div>
                        <span className="">{user?.nombre} {user?.apellido}</span>
                      </div>
                      <div className="grid grid-cols-2 text-gray-400 mb-2">
                        <span className="text-sm">{user?.email}</span>
                        <span className="text-sm">{user?.celular}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="grid grid-cols-2 text-gray-400">Paquete Actual: </div>
                        {
                          <div key={user.paqueteActual?.id} className='bg-slate-600 p-2 rounded-lg grid grid-cols-2 text-center text-xs justify-center items-center'>
                            <div>{user.paqueteActual?.titulo}</div>
                            <div>${user.paqueteActual?.precio}</div>
                          </div>
                        }
                        <div className="grid grid-cols-2 text-gray-400 mt-4">Facturas Pendientes: </div>
                        {
                          user?.Facturas?.map((factura: Factura, i) => {
                            const isInCart = carShop.some((item) => item.id === factura.id);
                            const statusItemCarClass = cn(
                              {
                                'bg-rose-500': user.recargo,
                                'bg-slate-600': !user.recargo,
                              }
                            );

                            return (
                              <div key={ i } className={`${statusItemCarClass} p-2 rounded-lg grid grid-cols-4 text-center text-xs justify-center items-center mb-2`}>
                                <div>{factura?.fecha}</div>
                                <div>{factura?.titulo}</div>
                                <div>${factura?.precio}</div>
                                { !isInCart && 
                                  <div className="flex justify-center items-center cursor-pointer" onClick={() => addCarShop({ id: factura.id, fecha: factura?.fecha, titulo: factura?.titulo, precio: factura?.precio, cantidad: 1, type: 'paquete', idfactura: factura.idfactura })}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                  </div>
                                }
                              </div>
                            )
                          }
                          )
                        }
                      </div>
                    </div>}
                  </div>}
              </div>
            </div>
            {
              carShop.length > 0 &&
              <div className="flex flex-col mt-7 bg-gray-700 p-2 rounded-lg">
                <div className="flex gap-1 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  <h1 className="text-xl">Carrito</h1>
                </div>
                <div className="grid grid-cols-3 font-semibold">
                  <span>Nombre</span>
                  <span>Precio</span>
                  <span>Cantidad</span>
                </div>
                {
                  carShop?.map(item =>
                    <div key={item?.id} className="grid grid-cols-3 text-xs my-2">
                      <span>{item?.titulo}</span>
                      <span>${item?.precio}</span>
                      <div className="grid grid-cols-3">
                        <button className={s["Cobranza-buttonCounter"]} onClick={() => decrementQuantity(item.id)}>
                          -
                        </button>
                        <div className="text-center">
                          {item?.cantidad}
                        </div>
                        <button className={s["Cobranza-buttonCounter"]} onClick={() => incrementQuantity(item.id)}>
                          +
                        </button>
                      </div>
                    </div>)
                }
                <div className="border-t border-gray-800 flex justify-end py-2">
                  <div><span className="font-bold">Total:</span> ${totalPrecio}</div>
                </div>
              </div>
            }
            {
              carShop.length > 0 && <div className="flex flex-col">
              <label className="block mt-4 text-gray-400 text-sm" htmlFor="payment-method">
                Método de Pago
              </label>
              <select className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" id="payment-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Efectivo">Efectivo</option>
                <option value="TarjetaDC">Tarjeta Débito/Crédito</option>
                <option value="Deposito">Depósito</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
            }
            <button className={(carShop.length == 0 || isLoading) ? s["Cobranza-buttonDisable"] : s["Cobranza-buttonPay"]} disabled={ carShop.length == 0 || isLoading } onClick={() => sendPay()}>
              { !isLoading
                ?
                'Pagar'
                :
                'Pagando...'
              }
            </button>
            <button className="bg-rose-500 text-white px-4 py-2 mt-4 rounded w-full" onClick={() => closeDrawerVenta()}>
              Cancelar
            </button>
          </div>
        </div>
      </Drawer>

      {/* Drawer Nuevo Gasto */}
      <Drawer anchor="right" open={openGasto} onClose={() => setOpenGasto(false)}>
        <div className="w-96 p-4">
          <form onSubmit={(e) => SubmitVenta(e)}>
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
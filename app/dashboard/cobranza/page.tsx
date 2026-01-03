"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  const [paymentReference, setPaymentReference] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [isOpenCaja, setIsOpenCaja] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [montoApertura, setMontoApertura] = useState("");
  const [montoCierre, setMontoCierre] = useState("");
  const [caja, setCaja] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasShownAlert = useRef(false);
  const { toast } = useToast();

  // Memoizar la fecha actual
  const currentDateMemo = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    const employee = sessionStorage.getItem("loginUser");
    const storedCaja = sessionStorage.getItem("caja");

    if (employee) {
      try {
        const parsedEmp = JSON.parse(employee);
        setEmployee(parsedEmp);
      } catch (err) {
        console.error("Error parsing employee:", err);
      }
    }

    if (!storedCaja && !hasShownAlert.current) {
      alert('La caja aún no está abierta');
      hasShownAlert.current = true;
    }

    setCurrentDate(currentDateMemo);
  }, [currentDateMemo]);

  useEffect(() => {
    const storedCaja = sessionStorage.getItem("caja");
    const selectedUser = sessionStorage.getItem("selectedUser");

    if (storedCaja) {
      try {
        const parsedCaja = JSON.parse(storedCaja);
        setCaja(parsedCaja);
        setIsOpenCaja(true);
      } catch (err) {
        console.error("Error parsing caja:", err);
        setIsOpenCaja(false);
      }
    } else {
      setIsOpenCaja(false);
    }

    if (selectedUser && isOpenCaja) {
      try {
        const parsedUser = JSON.parse(selectedUser);
        if (Array.isArray(parsedUser) && parsedUser.length > 0) {
          setUser(parsedUser[0]);
          setOpenVenta(true);
          setTabNew(2);
          fetchDataUser(parsedUser[0]?.id);
        }
      } catch (err) {
        console.error("Error parsing selectedUser:", err);
      }
    }
  }, [isOpenCaja, isDialogOpen]);

  const fetchDataUser = useCallback(async (userId: string) => {
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
    }
  }, [carShop.length]);

  const addCarShop = useCallback((item: ItemCarInt) => {
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
  }, []);
  

  const incrementQuantity = useCallback((id: number) => {
    setCarShop((prevCarShop) =>
      prevCarShop.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  }, []);

  const decrementQuantity = useCallback((id: number) => {
    setCarShop((prevCarShop) =>
      prevCarShop
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0) // Elimina si la cantidad llega a 0
    );
  }, []);

  const openDrawerVenta = useCallback(() => {
    setOpenVenta(true);
    setTabNew(1);
  }, []);

  const closeDrawerVenta = useCallback(() => {
    if (carShop.length > 0) {
      setCarShop([]);
    }

    setUser(null);
    setPaymentReference(""); // Limpiar referencia al cerrar
    setPaymentMethod("Efectivo"); // Resetear método de pago
    setSearchUserId(""); // Limpiar búsqueda
    sessionStorage.removeItem("selectedUser"); // Limpia user del storage
    setOpenVenta(false);
  }, [carShop.length]);


  const SubmitVenta = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  }

  const totalPrecio = useMemo(() => {
    return carShop.reduce((total, item) => {
      return total + (item.precio * item.cantidad);
    }, 0);
  }, [carShop]);

  // Memoizar los IDs del carrito para búsquedas rápidas
  const carShopIds = useMemo(() => {
    return new Set(carShop.map(item => item.id));
  }, [carShop]);

  const sendPay = useCallback(async () => {
    // Validar que si el método de pago no es Efectivo, debe tener referencia
    if (paymentMethod !== "Efectivo" && !paymentReference.trim()) {
      toast({
        title: "Referencia requerida",
        description: "Por favor ingresa la referencia del pago.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const paymentData: {
        idusuario: number | undefined;
        carshop: typeof carShop;
        metodo: string;
        referencia?: string;
      } = {
        idusuario: user?.id,
        carshop: carShop, 
        metodo: paymentMethod,
      };

      // Solo agregar referencia si el método no es Efectivo
      if (paymentMethod !== "Efectivo" && paymentReference.trim()) {
        paymentData.referencia = paymentReference.trim();
      }

      const response = await axios.post('https://monkfish-app-2et8k.ondigitalocean.app/api/payment', paymentData);
      
      const { pagoexitoso } = response.data;

      if (pagoexitoso) {
        toast({
          title: "Pago exitoso",
          description: "Tu pago se ha procesado correctamente.",
        });
        // Limpiar todo después del pago exitoso
        setCarShop([]);
        setUser(null);
        setPaymentReference("");
        setPaymentMethod("Efectivo");
        setSearchUserId(""); // Limpiar búsqueda
        sessionStorage.removeItem("selectedUser");
      }
      
    } catch (err) {
      console.log('error' + err)
      toast({
        title: "Error al procesar el pago",
        description: "Hubo un problema al procesar tu pago. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [paymentMethod, paymentReference, carShop, user?.id, toast]);

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
      employeeId: caja.employeeId.toString()
    };

    try {
      const resp = await axios.post("https://cms.regatelecom.mx/api/cajas", { data: cajaCerrada });

      if (resp?.status && resp?.status == 200) {
        sessionStorage.removeItem("caja");
        setCaja(null);
        setMontoCierre("");
        setIsOpenCaja(false);
        setIsDialogOpen(false);
      }
    } catch (err) {
      console.error("Error al cerrar caja:", err);
    }
  };

  return (
    <div className={s.Cobranza}>
      {/* Header */}
      <div className={s["Cobranza-header"]}>
        <div className={s["Cobranza-cashInit"]}>
          <div className={s["Cobranza-search"]}>
            <div className="w-full sm:w-[200px] md:w-[250px] lg:w-[300px] h-10 border border-gray-300 rounded-lg flex p-2">
              <input type="number" pattern="[0-9]*" name='userId' required className="bg-transparent border-none outline-none w-[90%] h-full  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]" placeholder="Buscar Producto" />
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>
          <button className={`${!isOpenCaja ? s["Cobranza-openCaja"] : s["Cobranza-closeCaja"]} text-sm sm:text-base whitespace-nowrap flex-shrink-0`} onClick={() => setIsDialogOpen(true)}>
            🏦 {!isOpenCaja ? 'Abrir caja' : 'Cerrar caja'}
          </button>
        </div>
        <div className={s["Cobranza-actions"]}>
          <button
            className={`${isOpenCaja ? s["Cobranza-buttonVenta"] : s["Cobranza-buttonDisVentaGast"]} whitespace-nowrap`}
            onClick={() => openDrawerVenta()}
            disabled={ !isOpenCaja }
          >
            ✅ Nueva venta
          </button>
          <button
            className={`${isOpenCaja ? s["Cobranza-buttonGasto"] : s["Cobranza-buttonDisVentaGast"]} whitespace-nowrap`}
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
            <div className="flex justify-center items-center text-center w-full px-4">
              <span className="text-xl sm:text-2xl lg:text-4xl">
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
        <div className="w-full sm:w-96 md:w-[420px] h-full p-4 sm:p-6 bg-gray-800 outline outline-black/5 font-roboto text-white overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                Crear Venta
              </h2>
              <button 
                onClick={() => setOpenVenta(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Cerrar"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <div>
              <nav className="flex border-gray-700 border rounded-lg h-11 items-center justify-center relative bg-gray-700/50">
                <div 
                  className={`w-1/2 text-center cursor-pointer relative border-r border-gray-700 h-full flex items-center justify-center transition-colors ${
                    tab == 1 
                      ? 'text-white bg-gray-600 font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`} 
                  onClick={() => setTabNew(1)}
                >
                  Producto
                </div>
                <div 
                  className={`w-1/2 text-center cursor-pointer relative h-full flex items-center justify-center transition-colors ${
                    tab != 1 
                      ? 'text-white bg-gray-600 font-medium' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`} 
                  onClick={() => setTabNew(2)}
                >
                  Paquete
                </div>
              </nav>
              <div>
                {tab === 1 ? (
                  <div className="mt-4">
                    <label className="block mb-2 text-gray-300 text-sm font-medium">
                      Buscar Producto
                    </label>
                    <div className="w-full h-11 border border-gray-700 rounded-lg flex items-center p-3 bg-gray-700/30 focus-within:border-gray-600 focus-within:bg-gray-700/50 transition-colors">
                      <input 
                        type="number" 
                        pattern="[0-9]*" 
                        placeholder="ID del producto"
                        className="bg-transparent border-none outline-none w-full h-full text-white placeholder-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]" 
                      />
                      <button type="button" className="text-gray-400 hover:text-white transition-colors ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col mt-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const userId = (e.currentTarget.userId as HTMLInputElement).value;
                      setSearchUserId(userId);
                      fetchDataUser(userId);
                    }}
                      className="mb-4"
                    >
                      <label className="block mb-2 text-gray-300 text-sm font-medium">
                        Buscar Cliente
                      </label>
                      <div className="w-full h-11 border border-gray-700 rounded-lg flex items-center p-3 bg-gray-700/30 focus-within:border-gray-600 focus-within:bg-gray-700/50 transition-colors">
                        <input 
                          type="number" 
                          pattern="[0-9]*" 
                          name='userId' 
                          required 
                          value={searchUserId}
                          onChange={(e) => setSearchUserId(e.target.value)}
                          placeholder="ID del cliente"
                          className="bg-transparent border-none outline-none w-full h-full text-white placeholder-gray-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]" 
                        />
                        <button type="submit" className="text-gray-400 hover:text-white transition-colors ml-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                          </svg>
                        </button>
                      </div>
                    </form>
                    {user && (
                      <div className="flex flex-col space-y-4">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-white mb-2">{user?.nombre} {user?.apellido}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-sm">
                            <div>
                              <span className="text-gray-400">Email: </span>
                              <span>{user?.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Teléfono: </span>
                              <span>{user?.celular}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Paquete Actual</h4>
                            {user.paqueteActual && (
                              <div key={user.paqueteActual?.id} className='bg-slate-600/70 p-3 rounded-lg flex justify-between items-center'>
                                <span className="text-white font-medium">{user.paqueteActual?.titulo}</span>
                                <span className="text-white font-semibold">${user.paqueteActual?.precio}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Facturas Pendientes</h4>
                            {
                              user?.Facturas?.map((factura: Factura, i) => {
                                const isInCart = carShopIds.has(factura.id);
                                const statusItemCarClass = cn(
                                  {
                                    'bg-rose-500': user.recargo,
                                    'bg-slate-600': !user.recargo,
                                  }
                                );

                                return (
                                  <div key={i} className={`${statusItemCarClass} p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2`}>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white font-medium truncate">{factura?.titulo}</div>
                                      <div className="text-gray-300 text-xs">{factura?.fecha}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-white font-semibold">${factura?.precio}</span>
                                      { !isInCart && 
                                        <button 
                                          className="flex justify-center items-center cursor-pointer bg-gray-500 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                          onClick={() => addCarShop({ id: factura.id, fecha: factura?.fecha, titulo: factura?.titulo, precio: factura?.precio, cantidad: 1, type: 'paquete', idfactura: factura.idfactura })}
                                          aria-label="Agregar al carrito"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                          </svg>
                                        </button>
                                      }
                                    </div>
                                  </div>
                                )
                              })
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {
            carShop.length > 0 && (
              <div className="flex flex-col mt-6 bg-gray-700/70 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Carrito</h3>
                </div>
                <div className="space-y-3">
                  {
                    carShop?.map(item =>
                      <div key={item?.id} className="bg-gray-600/50 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{item?.titulo}</div>
                          <div className="text-gray-300 text-sm">${item?.precio} c/u</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-gray-700 rounded-lg">
                            <button 
                              className="px-3 py-1.5 text-white hover:bg-gray-600 transition-colors rounded-l-lg" 
                              onClick={() => decrementQuantity(item.id)}
                              aria-label="Decrementar cantidad"
                            >
                              -
                            </button>
                            <span className="px-3 py-1.5 text-white font-medium min-w-[2rem] text-center">
                              {item?.cantidad}
                            </span>
                            <button 
                              className="px-3 py-1.5 text-white hover:bg-gray-600 transition-colors rounded-r-lg" 
                              onClick={() => incrementQuantity(item.id)}
                              aria-label="Incrementar cantidad"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-white font-semibold min-w-[4rem] text-right">
                            ${(item?.precio * item?.cantidad).toFixed(2)}
                          </div>
                        </div>
                      </div>)
                  }
                </div>
                <div className="border-t border-gray-600 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Total:</span>
                  <span className="text-white text-xl font-bold">${totalPrecio.toFixed(2)}</span>
                </div>
              </div>
            )}
            {
              carShop.length > 0 && (
                <div className="flex flex-col mt-6">
              <label className="block mb-2 text-gray-300 text-sm font-medium" htmlFor="payment-method">
                Método de Pago
              </label>
              <select 
                className="w-full h-11 border border-gray-700 rounded-lg bg-gray-700/30 text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                id="payment-method" 
                value={paymentMethod} 
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  // Limpiar referencia si se cambia a Efectivo
                  if (e.target.value === "Efectivo") {
                    setPaymentReference("");
                  }
                }}
              >
                <option value="Efectivo" className="bg-gray-700">Efectivo</option>
                <option value="TarjetaDC" className="bg-gray-700">Tarjeta Débito/Crédito</option>
                <option value="Deposito" className="bg-gray-700">Depósito</option>
                <option value="Transferencia" className="bg-gray-700">Transferencia</option>
              </select>
              </div>
            )}
            {
              carShop.length > 0 && paymentMethod !== "Efectivo" && (
                <div className="flex flex-col mt-4">
                  <label className="block mb-2 text-gray-300 text-sm font-medium" htmlFor="payment-reference">
                    Referencia <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="payment-reference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Ingresa la referencia del pago"
                    className="w-full h-11 border border-gray-700 rounded-lg bg-gray-700/30 text-white text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500"
                    required={paymentMethod !== "Efectivo"}
                  />
                </div>
              )
            }
            <div className="mt-6 space-y-3">
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  carShop.length == 0 || isLoading || (paymentMethod !== "Efectivo" && !paymentReference.trim())
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`} 
                disabled={ carShop.length == 0 || isLoading || (paymentMethod !== "Efectivo" && !paymentReference.trim()) } 
                onClick={() => sendPay()}
              >
                { !isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-credit-card"></i>
                    Pagar ${totalPrecio.toFixed(2)}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                )}
              </button>
              <button 
                className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors" 
                onClick={() => closeDrawerVenta()}
              >
                Cancelar
              </button>
            </div>
        </div>
      </Drawer>

      {/* Drawer Nuevo Gasto */}
      <Drawer anchor="right" open={openGasto} onClose={() => setOpenGasto(false)}>
        <div className="w-full sm:w-96 md:w-[420px] h-full p-4 sm:p-6 bg-white overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Nuevo Gasto
              </h2>
              <button 
                onClick={() => setOpenGasto(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Cerrar"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
          </div>
          <form onSubmit={(e) => SubmitVenta(e)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Fecha del gasto <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                required
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Categoría del gasto <span className="text-red-500">*</span>
              </label>
              <select 
                required
                className="w-full h-11 border border-gray-300 rounded-lg px-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Selecciona una categoría</option>
                <option value="servicios">Servicios</option>
                <option value="suministros">Suministros</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Monto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full h-11 border border-gray-300 rounded-lg pl-8 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]" 
                />
              </div>
            </div>
            <div className="pt-4 space-y-3">
              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                Crear Gasto
              </button>
              <button 
                type="button"
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors" 
                onClick={() => setOpenGasto(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </Drawer>
    </div>
  );
}

export default Cobranza;
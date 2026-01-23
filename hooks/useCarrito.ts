import { useState, useCallback, useMemo } from "react";
import { ItemCarrito } from "@/types/cobranza";

interface UseCarritoReturn {
  carrito: ItemCarrito[];
  total: number;
  cantidadItems: number;
  agregarItem: (item: ItemCarrito) => void;
  eliminarItem: (id: number) => void;
  incrementarCantidad: (id: number) => void;
  decrementarCantidad: (id: number) => void;
  limpiarCarrito: () => void;
  estaEnCarrito: (id: number) => boolean;
  obtenerItem: (id: number) => ItemCarrito | undefined;
}

/**
 * Hook personalizado para gestionar el carrito de compras
 */
export function useCarrito(): UseCarritoReturn {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  /**
   * Calcula el total del carrito
   */
  const total = useMemo(() => {
    return carrito.reduce((suma, item) => {
      return suma + item.precio * item.cantidad;
    }, 0);
  }, [carrito]);

  /**
   * Calcula la cantidad total de items
   */
  const cantidadItems = useMemo(() => {
    return carrito.reduce((suma, item) => suma + item.cantidad, 0);
  }, [carrito]);

  /**
   * Agrega un item al carrito o incrementa su cantidad si ya existe
   */
  const agregarItem = useCallback((item: ItemCarrito) => {
    setCarrito((prevCarrito) => {
      const existingItem = prevCarrito.find(
        (product) => product.id === item.id
      );

      if (existingItem) {
        // Si el producto existe, incrementar la cantidad
        return prevCarrito.map((product) =>
          product.id === item.id
            ? { ...product, cantidad: product.cantidad + 1 }
            : product
        );
      } else {
        // Si el producto no existe, agregarlo al carrito
        return [...prevCarrito, { ...item, cantidad: item.cantidad || 1 }];
      }
    });
  }, []);

  /**
   * Elimina un item del carrito
   */
  const eliminarItem = useCallback((id: number) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id));
  }, []);

  /**
   * Incrementa la cantidad de un item
   */
  const incrementarCantidad = useCallback((id: number) => {
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  }, []);

  /**
   * Decrementa la cantidad de un item, eliminándolo si llega a 0
   */
  const decrementarCantidad = useCallback((id: number) => {
    setCarrito((prevCarrito) =>
      prevCarrito
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }, []);

  /**
   * Limpia todo el carrito
   */
  const limpiarCarrito = useCallback(() => {
    setCarrito([]);
  }, []);

  /**
   * Verifica si un item está en el carrito
   */
  const estaEnCarrito = useCallback(
    (id: number) => {
      return carrito.some((item) => item.id === id);
    },
    [carrito]
  );

  /**
   * Obtiene un item del carrito por su ID
   */
  const obtenerItem = useCallback(
    (id: number) => {
      return carrito.find((item) => item.id === id);
    },
    [carrito]
  );

  return {
    carrito,
    total,
    cantidadItems,
    agregarItem,
    eliminarItem,
    incrementarCantidad,
    decrementarCantidad,
    limpiarCarrito,
    estaEnCarrito,
    obtenerItem,
  };
}

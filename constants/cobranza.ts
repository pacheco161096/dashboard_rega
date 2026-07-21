/**
 * Constantes para el módulo de cobranza
 */

// ==================== MÉTODOS DE PAGO ====================

export const METODOS_PAGO = {
  EFECTIVO: "Efectivo",
  TARJETA_DC: "TarjetaDC",
  DEPOSITO: "Deposito",
  TRANSFERENCIA: "Transferencia",
} as const;

export type MetodoPago = (typeof METODOS_PAGO)[keyof typeof METODOS_PAGO];

export const METODOS_PAGO_ARRAY: Array<{
  value: MetodoPago;
  label: string;
}> = [
  { value: METODOS_PAGO.EFECTIVO, label: "Efectivo" },
  { value: METODOS_PAGO.TARJETA_DC, label: "Tarjeta Débito/Crédito" },
  { value: METODOS_PAGO.DEPOSITO, label: "Depósito" },
  { value: METODOS_PAGO.TRANSFERENCIA, label: "Transferencia" },
];

/**
 * Verifica si un método de pago requiere referencia
 */
export const requiereReferencia = (metodo: MetodoPago): boolean => {
  return metodo !== METODOS_PAGO.EFECTIVO;
};

// ==================== CONCEPTOS DE GASTOS ====================

export const CONCEPTOS_GASTO = {
  SERVICIOS: "servicios",
  SUMINISTROS: "suministros",
  MANTENIMIENTO: "mantenimiento",
  OTROS: "otros",
} as const;

export type ConceptoGasto =
  (typeof CONCEPTOS_GASTO)[keyof typeof CONCEPTOS_GASTO];

export const CONCEPTOS_GASTO_ARRAY: Array<{
  value: ConceptoGasto;
  label: string;
}> = [
  { value: CONCEPTOS_GASTO.SERVICIOS, label: "Servicios" },
  { value: CONCEPTOS_GASTO.SUMINISTROS, label: "Suministros" },
  { value: CONCEPTOS_GASTO.MANTENIMIENTO, label: "Mantenimiento" },
  { value: CONCEPTOS_GASTO.OTROS, label: "Otros" },
];

// ==================== TABS DE VENTA ====================

export const TABS_VENTA = {
  PRODUCTO: 1,
  PAQUETE: 2,
} as const;

export type TabVenta = (typeof TABS_VENTA)[keyof typeof TABS_VENTA];

// ==================== MENSAJES ====================

export const MENSAJES = {
  CAJA_NO_ABIERTA: "La caja aún no está abierta",
  CAJA_CERRADA: "Caja cerrada. Ábrela para empezar a operar.",
  REFERENCIA_REQUERIDA: "Por favor ingresa la referencia del pago.",
  GASTO_CREADO: "Gasto creado correctamente",
  GASTO_CREADO_DESCRIPCION: "El gasto se ha creado correctamente.",
  ERROR_CREAR_GASTO: "Error al crear el gasto",
  ERROR_CREAR_GASTO_DESCRIPCION:
    "Hubo un problema al crear el gasto. Por favor intenta nuevamente.",
  PAGO_EXITOSO: "Pago exitoso",
  PAGO_EXITOSO_DESCRIPCION: "Tu pago se ha procesado correctamente.",
  ERROR_PROCESAR_PAGO: "Error al procesar el pago",
  ERROR_PROCESAR_PAGO_DESCRIPCION:
    "Hubo un problema al procesar tu pago. Por favor intenta nuevamente.",
  ERROR_CERRAR_CAJA: "Error al cerrar caja",
  ERROR_CERRAR_CAJA_DESCRIPCION:
    "No se pudo identificar el empleado. Por favor intenta nuevamente.",
  ERROR_ID_CLIENTE_REQUERIDO: "El ID del cliente es requerido",
  ERROR_CARRITO_VACIO: "El carrito no puede estar vacío",
} as const;

// ==================== VALORES POR DEFECTO ====================

export const VALORES_DEFECTO = {
  METODO_PAGO: METODOS_PAGO.EFECTIVO,
  TAB_VENTA: TABS_VENTA.PRODUCTO,
  MONTO_APERTURA_MINIMO: 0,
} as const;

// ==================== STORAGE KEYS ====================

export const STORAGE_KEYS = {
  LOGIN_USER: "loginUser",
  CAJA: "caja",
  SELECTED_USER: "selectedUser",
} as const;

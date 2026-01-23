/**
 * Tipos TypeScript para el módulo de cobranza
 */

// ==================== GASTOS ====================

export interface GastoFormData {
  date: string;
  concepto: string;
  monto: string;
  metodo: string;
}

export interface GastoAttributes {
  fecha: string;
  metodo: string;
  idusuario: string;
  concepto: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  monto: number;
}

export interface Gasto {
  id: number;
  attributes: GastoAttributes;
}

export interface CreateGastoRequest {
  idusuario: string;
  fecha: string;
  concepto: string;
  monto: string | number;
  metodo: string;
}

// ==================== TRANSACCIONES ====================

export interface Transaccion {
  fecha: string;
  idTransaccion: number;
  idProducto: number;
  titulo: string;
  precio: number;
  cantidad: number;
  total: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// ==================== VENTAS ====================

export interface VentaAttributes {
  fecha: string;
  tipo: string;
  metodo: string;
  idusuario: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  referencia: string;
}

export interface Venta {
  id: number;
  attributes: VentaAttributes;
}

// ==================== CAJA ====================

export interface CajaAttributes {
  montoApertura: number;
  montoCierre?: number;
  fechaHoraApertura: string;
  fechaHoraCierre?: string;
  employeeId: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Caja {
  id: number;
  attributes?: CajaAttributes;
  montoApertura?: number;
  montoCierre?: number;
  fechaHoraApertura?: string;
  fechaHoraCierre?: string;
  employeeId?: string;
}

export interface CreateCajaRequest {
  montoApertura: number;
  fechaHoraApertura: string;
  employeeId: string;
}

export interface UpdateCajaRequest {
  montoApertura?: number;
  montoCierre: number;
  fechaHoraCierre: string;
  employeeId: string;
}

// ==================== PAGOS ====================

export interface ItemCarrito {
  idfactura: string;
  id: number;
  titulo: string;
  precio: number;
  cantidad: number;
  type: string;
  fecha: string;
}

export interface PaymentRequest {
  idCliente: number | undefined;
  idUsuario: string | undefined;
  carshop: ItemCarrito[];
  metodo: string;
  referencia?: string;
}

export interface PaymentResponse {
  pagoexitoso: boolean;
  [key: string]: unknown;
}

// ==================== CLIENTES ====================

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  recargo?: boolean;
  paqueteActual?: {
    id: number;
    titulo: string;
    precio: number;
  };
  Facturas?: Factura[];
}

export interface Factura {
  id: number;
  idfactura: string;
  titulo: string;
  precio: number;
  fecha: string;
}

// ==================== RESPONSES DE STRAPI ====================

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

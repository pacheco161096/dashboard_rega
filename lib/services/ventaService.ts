import {
  cmsApi,
  businessApi,
  handleApiError,
  buildDateRangeFilter,
  getTodayISO,
} from "@/lib/api/config";
import {
  Venta,
  Transaccion,
  PaymentRequest,
  PaymentResponse,
  StrapiCollectionResponse,
} from "@/types/cobranza";

const TRANSACCIONES_BATCH_SIZE = 50;

type TransaccionStrapiItem = {
  attributes: Transaccion;
};

function dedupeTransacciones(transacciones: Transaccion[]): Transaccion[] {
  return transacciones.filter(
    (transaccion, index, self) =>
      index ===
      self.findIndex(
        (item) =>
          item.idTransaccion === transaccion.idTransaccion &&
          item.idProducto === transaccion.idProducto
      )
  );
}

function chunkIds(ids: number[], size: number): number[][] {
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

function buildTransaccionesByIdsQuery(ids: number[]): string {
  const query = new URLSearchParams();

  ids.forEach((id, index) => {
    query.append(`filters[idTransaccion][$in][${index}]`, String(id));
  });

  query.append("pagination[pageSize]", String(Math.max(ids.length, 25)));

  return query.toString();
}

/**
 * Servicio para gestionar operaciones relacionadas con ventas y transacciones
 */
export class VentaService {
  /**
   * Obtiene las ventas del día actual para un usuario específico
   * @param userId - ID del usuario
   * @param fecha - Fecha en formato ISO (YYYY-MM-DD). Si no se proporciona, usa la fecha actual
   * @returns Lista de ventas del día
   */
  static async obtenerVentasDelDia(
    userId: string,
    fecha?: string
  ): Promise<Venta[]> {
    try {
      const fechaFiltro = fecha || getTodayISO();
      const dateFilter = buildDateRangeFilter(
        "createdAt",
        fechaFiltro,
        fechaFiltro
      );
      const filters = `filters[idusuario][$eq]=${userId}&${dateFilter}`;

      const response = await cmsApi.get<StrapiCollectionResponse<Venta>>(
        `/ventas-salidas?${filters}`
      );

      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene una transacción por su ID de transacción
   * @param idTransaccion - ID de la transacción
   * @returns Los atributos de la transacción o null si no se encuentra
   */
  static async obtenerTransaccion(
    idTransaccion: number
  ): Promise<Transaccion | null> {
    try {
      const [transaccion] = await this.obtenerTransaccionesPorIds([idTransaccion]);
      return transaccion ?? null;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene transacciones en lote por lista de idTransaccion (1 request por chunk)
   */
  static async obtenerTransaccionesPorIds(
    idTransacciones: number[]
  ): Promise<Transaccion[]> {
    const uniqueIds = [
      ...new Set(
        idTransacciones.filter((id) => Number.isFinite(id) && id > 0)
      ),
    ];

    if (uniqueIds.length === 0) {
      return [];
    }

    try {
      const chunks = chunkIds(uniqueIds, TRANSACCIONES_BATCH_SIZE);
      const chunkResults = await Promise.all(
        chunks.map(async (chunk) => {
          const response = await cmsApi.get<
            StrapiCollectionResponse<TransaccionStrapiItem>
          >(`/transacciones?${buildTransaccionesByIdsQuery(chunk)}`);

          return (response.data.data || []).flatMap((item) =>
            item.attributes ? [item.attributes] : []
          );
        })
      );

      return dedupeTransacciones(chunkResults.flat());
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene todas las transacciones asociadas a una lista de ventas
   * @param ventas - Lista de ventas
   * @returns Lista de transacciones únicas (sin duplicados)
   */
  static async obtenerTransaccionesDeVentas(
    ventas: Venta[]
  ): Promise<Transaccion[]> {
    try {
      if (ventas.length === 0) {
        return [];
      }

      const idTransacciones = ventas.map((venta) => venta.id);
      return await this.obtenerTransaccionesPorIds(idTransacciones);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene las transacciones del día actual para un usuario específico
   * @param userId - ID del usuario
   * @param fecha - Fecha en formato ISO (YYYY-MM-DD). Si no se proporciona, usa la fecha actual
   * @returns Lista de transacciones del día
   */
  static async obtenerTransaccionesDelDia(
    userId: string,
    fecha?: string
  ): Promise<Transaccion[]> {
    try {
      // Primero obtener las ventas del día
      const ventas = await this.obtenerVentasDelDia(userId, fecha);

      // Luego obtener las transacciones asociadas
      return await this.obtenerTransaccionesDeVentas(ventas);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Procesa un pago
   * @param paymentData - Datos del pago a procesar
   * @returns Respuesta del procesamiento del pago
   */
  static async procesarPago(
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      // Validaciones
      if (!paymentData.idCliente) {
        throw new Error("El ID del cliente es requerido");
      }

      if (!paymentData.idUsuario) {
        throw new Error("El ID del usuario es requerido");
      }

      if (!paymentData.carshop || paymentData.carshop.length === 0) {
        throw new Error("El carrito no puede estar vacío");
      }

      // Validar que si el método no es Efectivo, debe tener referencia
      if (
        paymentData.metodo !== "Efectivo" &&
        (!paymentData.referencia || !paymentData.referencia.trim())
      ) {
        throw new Error(
          "La referencia es requerida para métodos de pago distintos a Efectivo"
        );
      }

      // Preparar datos del pago
      const dataToSend: PaymentRequest = {
        idCliente: paymentData.idCliente,
        idUsuario: paymentData.idUsuario,
        carshop: paymentData.carshop,
        metodo: paymentData.metodo,
      };

      // Solo agregar referencia si el método no es Efectivo
      if (paymentData.metodo !== "Efectivo" && paymentData.referencia) {
        dataToSend.referencia = paymentData.referencia.trim();
      }

      const response = await businessApi.post<PaymentResponse>(
        "/payment",
        dataToSend
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Calcula el total de ventas a partir de una lista de transacciones
   * @param transacciones - Lista de transacciones
   * @returns Total de ventas
   */
  static calcularTotalVentas(transacciones: Transaccion[]): number {
    return transacciones.reduce((total, transaccion) => {
      return total + (transaccion.total || 0);
    }, 0);
  }
}

// Exportar instancia singleton
export const ventaService = VentaService;

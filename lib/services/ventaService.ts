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
      const response = await cmsApi.get<
        StrapiCollectionResponse<{
          attributes: Transaccion;
        }>
      >(`/transacciones?filters[idTransaccion][$eq]=${idTransaccion}`);

      const transaccion = response.data.data?.[0];
      return transaccion?.attributes || null;
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
      // Obtener todas las transacciones en paralelo
      const transaccionesPromises = ventas.map((venta) =>
        this.obtenerTransaccion(venta.id)
      );

      const transacciones = await Promise.all(transaccionesPromises);

      // Filtrar transacciones nulas/undefined y duplicados
      const transaccionesUnicas = transacciones.filter(
        (transaccion, index, self) =>
          transaccion &&
          index ===
            self.findIndex(
              (t) =>
                t &&
                t.idTransaccion === transaccion.idTransaccion &&
                t.idProducto === transaccion.idProducto
            )
      ) as Transaccion[];

      return transaccionesUnicas;
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

import {
  cmsApi,
  handleApiError,
  buildDateRangeFilter,
  getTodayISO,
} from "@/lib/api/config";
import {
  Gasto,
  CreateGastoRequest,
  StrapiCollectionResponse,
  StrapiResponse,
} from "@/types/cobranza";

/**
 * Servicio para gestionar operaciones relacionadas con gastos
 */
export class GastoService {
  /**
   * Obtiene los gastos del día actual para un usuario específico
   * @param userId - ID del usuario
   * @param fecha - Fecha en formato ISO (YYYY-MM-DD). Si no se proporciona, usa la fecha actual
   * @returns Lista de gastos del día
   */
  static async obtenerGastosDelDia(
    userId: string,
    fecha?: string
  ): Promise<Gasto[]> {
    try {
      const fechaFiltro = fecha || getTodayISO();
      const dateFilter = buildDateRangeFilter(
        "createdAt",
        fechaFiltro,
        fechaFiltro
      );
      const filters = `filters[idusuario][$eq]=${userId}&${dateFilter}`;

      const response = await cmsApi.get<StrapiCollectionResponse<Gasto>>(
        `/gastos?${filters}`
      );

      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene los gastos en un rango de fechas para un usuario específico
   * @param userId - ID del usuario
   * @param fechaInicio - Fecha de inicio en formato ISO (YYYY-MM-DD)
   * @param fechaFin - Fecha de fin en formato ISO (YYYY-MM-DD)
   * @returns Lista de gastos en el rango de fechas
   */
  static async obtenerGastosPorRango(
    userId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<Gasto[]> {
    try {
      const dateFilter = buildDateRangeFilter(
        "createdAt",
        fechaInicio,
        fechaFin
      );
      const filters = `filters[idusuario][$eq]=${userId}&${dateFilter}`;

      const response = await cmsApi.get<StrapiCollectionResponse<Gasto>>(
        `/gastos?${filters}`
      );

      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Crea un nuevo gasto
   * @param gastoData - Datos del gasto a crear
   * @returns El gasto creado
   */
  static async crearGasto(
    gastoData: CreateGastoRequest
  ): Promise<StrapiResponse<Gasto>> {
    try {
      // Validar que el monto sea un número válido
      const monto =
        typeof gastoData.monto === "string"
          ? parseFloat(gastoData.monto)
          : gastoData.monto;

      if (isNaN(monto) || monto <= 0) {
        throw new Error("El monto debe ser un número positivo");
      }

      // Validar que la fecha sea válida
      const fechaISO = new Date(gastoData.fecha).toISOString();
      if (isNaN(new Date(fechaISO).getTime())) {
        throw new Error("La fecha proporcionada no es válida");
      }

      const response = await cmsApi.post<StrapiResponse<Gasto>>("/gastos", {
        data: {
          idusuario: gastoData.idusuario,
          fecha: fechaISO,
          concepto: gastoData.concepto,
          monto: monto,
          metodo: gastoData.metodo,
        },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene un gasto por su ID
   * @param gastoId - ID del gasto
   * @returns El gasto encontrado
   */
  static async obtenerGastoPorId(gastoId: number): Promise<Gasto> {
    try {
      const response = await cmsApi.get<StrapiResponse<Gasto>>(
        `/gastos/${gastoId}`
      );

      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Elimina un gasto
   * @param gastoId - ID del gasto a eliminar
   */
  static async eliminarGasto(gastoId: number): Promise<void> {
    try {
      await cmsApi.delete(`/gastos/${gastoId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Exportar instancia singleton (opcional, para mantener consistencia con otros servicios)
export const gastoService = GastoService;

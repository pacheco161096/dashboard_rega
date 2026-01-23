import { cmsApi, handleApiError } from "@/lib/api/config";
import {
  Caja,
  CreateCajaRequest,
  UpdateCajaRequest,
  StrapiResponse,
} from "@/types/cobranza";

/**
 * Servicio para gestionar operaciones relacionadas con la caja
 */
export class CajaService {
  /**
   * Abre una nueva caja
   * @param cajaData - Datos de la caja a abrir
   * @returns La caja creada
   */
  static async abrirCaja(
    cajaData: CreateCajaRequest
  ): Promise<StrapiResponse<Caja>> {
    try {
      // Validaciones
      if (!cajaData.montoApertura || cajaData.montoApertura < 0) {
        throw new Error("El monto de apertura debe ser un número positivo");
      }

      if (!cajaData.employeeId) {
        throw new Error("El ID del empleado es requerido");
      }

      if (!cajaData.fechaHoraApertura) {
        throw new Error("La fecha y hora de apertura es requerida");
      }

      const response = await cmsApi.post<StrapiResponse<Caja>>("/cajas", {
        data: {
          montoApertura: cajaData.montoApertura,
          fechaHoraApertura: cajaData.fechaHoraApertura,
          employeeId: cajaData.employeeId,
        },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Cierra una caja existente
   * @param cajaId - ID de la caja a cerrar
   * @param cajaData - Datos para cerrar la caja
   * @returns La caja actualizada
   */
  static async cerrarCaja(
    cajaId: number,
    cajaData: UpdateCajaRequest
  ): Promise<StrapiResponse<Caja>> {
    try {
      // Validaciones
      if (!cajaId) {
        throw new Error("El ID de la caja es requerido");
      }

      if (cajaData.montoCierre === undefined || cajaData.montoCierre < 0) {
        throw new Error("El monto de cierre debe ser un número positivo");
      }

      if (!cajaData.fechaHoraCierre) {
        throw new Error("La fecha y hora de cierre es requerida");
      }

      if (!cajaData.employeeId) {
        throw new Error("El ID del empleado es requerido");
      }

      const response = await cmsApi.put<StrapiResponse<Caja>>(
        `/cajas/${cajaId}`,
        {
          data: {
            montoCierre: cajaData.montoCierre,
            fechaHoraCierre: cajaData.fechaHoraCierre,
            employeeId: cajaData.employeeId,
            // Incluir montoApertura si está presente
            ...(cajaData.montoApertura !== undefined && {
              montoApertura: cajaData.montoApertura,
            }),
          },
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene una caja por su ID
   * @param cajaId - ID de la caja
   * @returns La caja encontrada
   */
  static async obtenerCajaPorId(cajaId: number): Promise<Caja> {
    try {
      const response = await cmsApi.get<StrapiResponse<Caja>>(
        `/cajas/${cajaId}`
      );

      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene el monto de apertura de una caja
   * Maneja tanto la estructura con attributes como sin attributes
   * @param caja - Objeto de caja
   * @returns Monto de apertura o 0 si no está disponible
   */
  static obtenerMontoApertura(caja: Caja | null | undefined): number {
    if (!caja) return 0;

    return caja.attributes?.montoApertura || caja.montoApertura || 0;
  }

  /**
   * Obtiene el employeeId de una caja
   * Maneja tanto la estructura con attributes como sin attributes
   * @param caja - Objeto de caja
   * @returns EmployeeId o null si no está disponible
   */
  static obtenerEmployeeId(caja: Caja | null | undefined): string | null {
    if (!caja) return null;

    const employeeId = caja.attributes?.employeeId || caja.employeeId;

    return employeeId ? String(employeeId) : null;
  }

  /**
   * Calcula el monto total de cierre
   * @param montoApertura - Monto inicial de apertura
   * @param totalVentas - Total de ventas del día
   * @param totalGastos - Total de gastos del día
   * @returns Monto total de cierre
   */
  static calcularMontoCierre(
    montoApertura: number,
    totalVentas: number,
    totalGastos: number
  ): number {
    const subtotal = totalVentas - totalGastos;
    return montoApertura + subtotal;
  }
}

// Exportar instancia singleton
export const cajaService = CajaService;

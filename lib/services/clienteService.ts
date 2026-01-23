import { businessApi, handleApiError } from "@/lib/api/config";
import { Cliente } from "@/types/cobranza";

/**
 * Servicio para gestionar operaciones relacionadas con clientes
 */
export class ClienteService {
  /**
   * Busca un cliente por su ID para operaciones de pago
   * @param userId - ID del usuario/cliente
   * @returns Datos del cliente con sus facturas pendientes
   */
  static async buscarClientePorId(userId: string): Promise<Cliente> {
    try {
      if (!userId || userId.trim() === "") {
        throw new Error("El ID del usuario es requerido");
      }

      const response = await businessApi.post<Cliente>("/searchUserPayment", {
        idusuario: userId,
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Valida que un cliente tenga facturas pendientes
   * @param cliente - Objeto cliente
   * @returns true si tiene facturas pendientes, false en caso contrario
   */
  static tieneFacturasPendientes(cliente: Cliente | null): boolean {
    return (
      cliente !== null &&
      Array.isArray(cliente.Facturas) &&
      cliente.Facturas.length > 0
    );
  }

  /**
   * Calcula el total de facturas pendientes de un cliente
   * @param cliente - Objeto cliente
   * @returns Total de facturas pendientes
   */
  static calcularTotalFacturasPendientes(cliente: Cliente | null): number {
    if (!this.tieneFacturasPendientes(cliente)) {
      return 0;
    }

    return (
      cliente?.Facturas?.reduce((total, factura) => {
        return total + (factura.precio || 0);
      }, 0) || 0
    );
  }
}

// Exportar instancia singleton
export const clienteService = ClienteService;

import { useState, useCallback } from "react";
import { clienteService } from "@/lib/services";
import { Cliente } from "@/types/cobranza";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/api/config";

interface UseClienteReturn {
  cliente: Cliente | null;
  isLoading: boolean;
  error: Error | null;
  buscarCliente: (userId: string) => Promise<void>;
  limpiarCliente: () => void;
  tieneFacturasPendientes: boolean;
  totalFacturasPendientes: number;
}

/**
 * Hook personalizado para gestionar la búsqueda de clientes
 */
export function useCliente(): UseClienteReturn {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Busca un cliente por su ID
   */
  const buscarCliente = useCallback(
    async (userId: string) => {
      if (!userId || userId.trim() === "") {
        setError(new Error("El ID del usuario es requerido"));
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const clienteData = await clienteService.buscarClientePorId(userId);
        setCliente(clienteData);
      } catch (err) {
        const customError = handleApiError(err);
        setError(customError);
        toast({
          title: "Error al buscar cliente",
          description: customError.message,
          variant: "destructive",
        });
        throw customError;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Limpia el cliente actual
   */
  const limpiarCliente = useCallback(() => {
    setCliente(null);
    setError(null);
  }, []);

  /**
   * Verifica si el cliente tiene facturas pendientes
   */
  const tieneFacturasPendientes =
    clienteService.tieneFacturasPendientes(cliente);

  /**
   * Calcula el total de facturas pendientes
   */
  const totalFacturasPendientes =
    clienteService.calcularTotalFacturasPendientes(cliente);

  return {
    cliente,
    isLoading,
    error,
    buscarCliente,
    limpiarCliente,
    tieneFacturasPendientes,
    totalFacturasPendientes,
  };
}

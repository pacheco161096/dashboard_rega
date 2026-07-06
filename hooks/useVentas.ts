import { useState, useEffect, useCallback } from "react";
import { ventaService } from "@/lib/services";
import { Transaccion } from "@/types/cobranza";
import { getTodayISO } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/api/config";

interface UseVentasReturn {
  transacciones: Transaccion[];
  totalVentas: number;
  isLoading: boolean;
  error: Error | null;
  obtenerTransaccionesDelDia: (userId: string, fecha?: string) => Promise<void>;
  refrescarVentas: () => Promise<void>;
}

interface UseVentasOptions {
  userId?: string;
  fecha?: string;
  autoLoad?: boolean;
}

/**
 * Hook personalizado para gestionar ventas y transacciones
 */
export function useVentas(options: UseVentasOptions = {}): UseVentasReturn {
  const { userId, fecha, autoLoad = false } = options;
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Calcula el total de ventas
   */
  const totalVentas = ventaService.calcularTotalVentas(transacciones);

  /**
   * Obtiene las transacciones del día
   */
  const obtenerTransaccionesDelDia = useCallback(
    async (userIdParam: string, fechaParam?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const fechaFiltro = fechaParam || getTodayISO();
        const transaccionesData = await ventaService.obtenerTransaccionesDelDia(
          userIdParam,
          fechaFiltro
        );
        setTransacciones(transaccionesData);
      } catch (err) {
        const customError = handleApiError(err);
        setError(customError);
        throw customError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Refresca las ventas
   */
  const refrescarVentas = useCallback(async () => {
    if (!userId) return;
    await obtenerTransaccionesDelDia(userId, fecha);
  }, [userId, fecha, obtenerTransaccionesDelDia]);

  /**
   * Carga automática de ventas si está habilitado
   */
  useEffect(() => {
    if (autoLoad && userId) {
      obtenerTransaccionesDelDia(userId, fecha).catch((err) => {
        toast({
          title: "Error al cargar ventas",
          description: err instanceof Error ? err.message : "No se pudieron cargar las ventas del día",
          variant: "destructive",
        });
      });
    }
  }, [autoLoad, userId, fecha, obtenerTransaccionesDelDia, toast]);

  return {
    transacciones,
    totalVentas,
    isLoading,
    error,
    obtenerTransaccionesDelDia,
    refrescarVentas,
  };
}

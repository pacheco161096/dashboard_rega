import { useState, useEffect, useCallback } from "react";
import { gastoService } from "@/lib/services";
import { Gasto, CreateGastoRequest } from "@/types/cobranza";
import { getTodayISO } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/api/config";

interface UseGastosReturn {
  gastos: Gasto[];
  totalGastos: number;
  isLoading: boolean;
  error: Error | null;
  obtenerGastosDelDia: (userId: string, fecha?: string) => Promise<void>;
  crearGasto: (gastoData: CreateGastoRequest) => Promise<void>;
  eliminarGasto: (gastoId: number) => Promise<void>;
  refrescarGastos: () => Promise<void>;
}

interface UseGastosOptions {
  userId?: string;
  fecha?: string;
  autoLoad?: boolean;
}

/**
 * Hook personalizado para gestionar gastos
 */
export function useGastos(options: UseGastosOptions = {}): UseGastosReturn {
  const { userId, fecha, autoLoad = false } = options;
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Calcula el total de gastos
   */
  const totalGastos = gastos.reduce((total, gasto) => {
    return total + (gasto.attributes.monto || 0);
  }, 0);

  /**
   * Obtiene los gastos del día
   */
  const obtenerGastosDelDia = useCallback(
    async (userIdParam: string, fechaParam?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const fechaFiltro = fechaParam || getTodayISO();
        const gastosData = await gastoService.obtenerGastosDelDia(
          userIdParam,
          fechaFiltro
        );
        setGastos(gastosData);
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
   * Crea un nuevo gasto
   */
  const crearGasto = useCallback(
    async (gastoData: CreateGastoRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        await gastoService.crearGasto(gastoData);
        toast({
          title: "Gasto creado correctamente",
          description: "El gasto se ha creado correctamente.",
        });

        // Refrescar gastos si hay userId configurado
        if (userId) {
          await obtenerGastosDelDia(userId, fecha);
        }
      } catch (err) {
        const customError = handleApiError(err);
        setError(customError);
        toast({
          title: "Error al crear el gasto",
          description: customError.message,
          variant: "destructive",
        });
        throw customError;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fecha, obtenerGastosDelDia, toast]
  );

  /**
   * Elimina un gasto
   */
  const eliminarGasto = useCallback(
    async (gastoId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        await gastoService.eliminarGasto(gastoId);
        toast({
          title: "Gasto eliminado",
          description: "El gasto se ha eliminado correctamente.",
        });

        // Refrescar gastos si hay userId configurado
        if (userId) {
          await obtenerGastosDelDia(userId, fecha);
        }
      } catch (err) {
        const customError = handleApiError(err);
        setError(customError);
        toast({
          title: "Error al eliminar el gasto",
          description: customError.message,
          variant: "destructive",
        });
        throw customError;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fecha, obtenerGastosDelDia, toast]
  );

  /**
   * Refresca los gastos
   */
  const refrescarGastos = useCallback(async () => {
    if (!userId) return;
    await obtenerGastosDelDia(userId, fecha);
  }, [userId, fecha, obtenerGastosDelDia]);

  /**
   * Carga automática de gastos si está habilitado
   */
  useEffect(() => {
    if (autoLoad && userId) {
      obtenerGastosDelDia(userId, fecha).catch(() => {
      });
    }
  }, [autoLoad, userId, fecha, obtenerGastosDelDia]);

  return {
    gastos,
    totalGastos,
    isLoading,
    error,
    obtenerGastosDelDia,
    crearGasto,
    eliminarGasto,
    refrescarGastos,
  };
}

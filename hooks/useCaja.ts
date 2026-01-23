import { useState, useEffect, useCallback } from "react";
import { cajaService } from "@/lib/services";
import { Caja, CreateCajaRequest, UpdateCajaRequest } from "@/types/cobranza";
import { STORAGE_KEYS } from "@/constants/cobranza";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/api/config";

interface UseCajaReturn {
  caja: Caja | null;
  isOpenCaja: boolean;
  isLoading: boolean;
  error: Error | null;
  abrirCaja: (data: CreateCajaRequest) => Promise<void>;
  cerrarCaja: (montoCierre: number) => Promise<void>;
  refrescarCaja: () => Promise<void>;
  obtenerMontoApertura: () => number;
  obtenerEmployeeId: () => string | null;
}

/**
 * Hook personalizado para gestionar el estado de la caja
 */
export function useCaja(): UseCajaReturn {
  const [caja, setCaja] = useState<Caja | null>(null);
  const [isOpenCaja, setIsOpenCaja] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Carga la caja desde sessionStorage al montar el componente
   */
  useEffect(() => {
    const cargarCajaDesdeStorage = () => {
      try {
        const storedCaja = sessionStorage.getItem(STORAGE_KEYS.CAJA);
        if (storedCaja) {
          const parsedCaja = JSON.parse(storedCaja);
          setCaja(parsedCaja);
          setIsOpenCaja(true);
        } else {
          setIsOpenCaja(false);
        }
      } catch (err) {
        console.error("Error parsing caja from storage:", err);
        setIsOpenCaja(false);
        setCaja(null);
      }
    };

    cargarCajaDesdeStorage();
  }, []);

  /**
   * Guarda la caja en sessionStorage
   */
  const guardarCajaEnStorage = useCallback((cajaData: Caja | null) => {
    if (cajaData) {
      sessionStorage.setItem(STORAGE_KEYS.CAJA, JSON.stringify(cajaData));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CAJA);
    }
  }, []);

  /**
   * Abre una nueva caja
   */
  const abrirCaja = useCallback(
    async (data: CreateCajaRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await cajaService.abrirCaja(data);
        const nuevaCaja = response.data;

        setCaja(nuevaCaja);
        setIsOpenCaja(true);
        guardarCajaEnStorage(nuevaCaja);

        toast({
          title: "Caja abierta",
          description: "La caja se ha abierto correctamente.",
        });
      } catch (err) {
        const customError = handleApiError(err);
        setError(customError);
        toast({
          title: "Error al abrir caja",
          description: customError.message,
          variant: "destructive",
        });
        throw customError;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, guardarCajaEnStorage]
  );

  /**
   * Cierra la caja actual
   */
  const cerrarCaja = useCallback(
    async (montoCierre: number) => {
      if (!caja) {
        throw new Error("No hay caja abierta para cerrar");
      }

      setIsLoading(true);
      setError(null);

      try {
        const employeeId = cajaService.obtenerEmployeeId(caja);
        if (!employeeId) {
          throw new Error(
            "No se pudo identificar el empleado. Por favor intenta nuevamente."
          );
        }

        const cajaData: UpdateCajaRequest = {
          montoCierre,
          fechaHoraCierre: new Date().toISOString(),
          employeeId,
        };

        await cajaService.cerrarCaja(caja.id, cajaData);

        setCaja(null);
        setIsOpenCaja(false);
        guardarCajaEnStorage(null);

        toast({
          title: "Caja cerrada",
          description: "La caja se ha cerrado correctamente.",
        });
      } catch (err) {
        const customError = handleApiError(err);
        setError(customError);
        toast({
          title: "Error al cerrar caja",
          description: customError.message,
          variant: "destructive",
        });
        throw customError;
      } finally {
        setIsLoading(false);
      }
    },
    [caja, toast, guardarCajaEnStorage]
  );

  /**
   * Refresca los datos de la caja desde el servidor
   */
  const refrescarCaja = useCallback(async () => {
    if (!caja?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const cajaActualizada = await cajaService.obtenerCajaPorId(caja.id);
      setCaja(cajaActualizada);
      guardarCajaEnStorage(cajaActualizada);
    } catch (err) {
      const customError = handleApiError(err);
      setError(customError);
    } finally {
      setIsLoading(false);
    }
  }, [caja?.id, guardarCajaEnStorage]);

  /**
   * Obtiene el monto de apertura de la caja actual
   */
  const obtenerMontoApertura = useCallback(() => {
    return cajaService.obtenerMontoApertura(caja);
  }, [caja]);

  /**
   * Obtiene el employeeId de la caja actual
   */
  const obtenerEmployeeId = useCallback(() => {
    return cajaService.obtenerEmployeeId(caja);
  }, [caja]);

  return {
    caja,
    isOpenCaja,
    isLoading,
    error,
    abrirCaja,
    cerrarCaja,
    refrescarCaja,
    obtenerMontoApertura,
    obtenerEmployeeId,
  };
}

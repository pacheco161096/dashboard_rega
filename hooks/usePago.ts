import { useState, useCallback } from "react";
import { ventaService } from "@/lib/services";
import { PaymentRequest } from "@/types/cobranza";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/api/config";
import { MENSAJES } from "@/constants/cobranza";

interface UsePagoReturn {
  isLoading: boolean;
  error: Error | null;
  procesarPago: (paymentData: PaymentRequest) => Promise<boolean>;
}

/**
 * Hook personalizado para procesar pagos
 */
export function usePago(): UsePagoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Procesa un pago
   */
  const procesarPago = useCallback(
    async (paymentData: PaymentRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const resultado = await ventaService.procesarPago(paymentData);

        if (resultado.pagoexitoso) {
          toast({
            title: MENSAJES.PAGO_EXITOSO,
            description: MENSAJES.PAGO_EXITOSO_DESCRIPCION,
          });
          return true;
        } else {
          throw new Error("El pago no fue exitoso");
        }
      } catch (err) {
        const customError = handleApiError(err);
        setError(customError);
        toast({
          title: MENSAJES.ERROR_PROCESAR_PAGO,
          description:
            customError.message || MENSAJES.ERROR_PROCESAR_PAGO_DESCRIPCION,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    isLoading,
    error,
    procesarPago,
  };
}

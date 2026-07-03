import { useState, useCallback } from 'react';
import { TicketFormData, TicketRequest } from '@/types/ticket';
import { ticketService } from '@/lib/ticketService';
import { useToast } from '@/hooks/use-toast';
import {
  firstFieldErrorMessage,
  hasFieldErrors,
  validateTicketForm,
} from '@/lib/utils/formValidation';

interface UseTicketFormReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  submitTicket: (formData: TicketFormData) => Promise<void>;
  resetState: () => void;
}

export const useTicketForm = (): UseTicketFormReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const submitTicket = useCallback(async (formData: TicketFormData): Promise<void> => {
    const validationErrors = validateTicketForm(formData);
    if (hasFieldErrors(validationErrors)) {
      const message = firstFieldErrorMessage(validationErrors);
      setError(message);
      toast({
        title: "Formulario incompleto",
        description: message,
        variant: "destructive",
      });
      return;
    }

    const clienteId = parseInt(formData.id_cliente, 10);
    const tecnicoId = parseInt(formData.id_tecnico, 10);

    if (Number.isNaN(clienteId) || Number.isNaN(tecnicoId)) {
      const message = "Los identificadores de cliente o técnico no son válidos";
      setError(message);
      toast({
        title: "Datos inválidos",
        description: message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const ticketData: TicketRequest = {
        data: {
          fecha: formData.fecha,
          id_cliente: clienteId,
          estatus: formData.estatus,
          id_tecnico: tecnicoId,
          actualizacion: [
            {
              fecha: formData.fecha,
              descripcion: formData.descripcion.trim(),
            }
          ]
        }
      };

      await ticketService.createTicket(ticketData);
      setSuccess(true);
      toast({
        title: "Ticket creado",
        description: "El ticket se registró correctamente",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear el ticket";
      console.error("Error al crear el ticket:", err);
      setError(message);
      toast({
        title: "Error al crear el ticket",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    success,
    submitTicket,
    resetState
  };
};

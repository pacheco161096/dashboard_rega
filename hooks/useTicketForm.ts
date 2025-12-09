import { useState } from 'react';
import { TicketFormData, TicketRequest } from '@/types/ticket';
import { ticketService } from '@/lib/ticketService';

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

  const submitTicket = async (formData: TicketFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Preparar los datos según la estructura esperada por la API
      const ticketData: TicketRequest = {
        data: {
          fecha: formData.fecha,
          id_cliente: parseInt(formData.id_cliente),
          estatus: formData.estatus,
          id_tecnico: parseInt(formData.id_tecnico),
          actualizacion: [
            {
              fecha: formData.fecha,
              descripcion: formData.descripcion
            }
          ]
        }
      };

      // Usar el servicio para crear el ticket
      const response = await ticketService.createTicket(ticketData);

      console.log("Respuesta de la API:", response);
      setSuccess(true);
      
    } catch (error: any) {
      console.error("Error al crear el ticket:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    success,
    submitTicket,
    resetState
  };
}; 
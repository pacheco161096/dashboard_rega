import { useState, useEffect } from "react";
import { ticketService } from "@/lib/ticketService";
import { TicketListResponse } from "@/types/ticket";

interface TicketStats {
  total: number;
  enProceso: number;
  finalizados: number;
  isLoading: boolean;
  error: string | null;
}

export const useTicketStats = (): TicketStats => {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    enProceso: 0,
    finalizados: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats((prev) => ({ ...prev, isLoading: true, error: null }));

        const response: TicketListResponse = await ticketService.getTickets();

        const tickets = response.data;
        const total = tickets.length;
        const enProceso = tickets.filter(
          (ticket) => ticket.attributes.estatus === "En proceso"
        ).length;
        const finalizados = tickets.filter(
          (ticket) => ticket.attributes.estatus === "Finalizado"
        ).length;

        setStats({
          total,
          enProceso,
          finalizados,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("Error al cargar estadísticas:", error);
        setStats((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
      }
    };

    loadStats();
  }, []);

  return stats;
};

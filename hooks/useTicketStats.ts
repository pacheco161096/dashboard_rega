import { useState, useEffect, useMemo, useCallback } from "react";
import { ticketService } from "@/lib/ticketService";
import { TicketListResponse } from "@/types/ticket";

interface TicketStats {
  total: number;
  enProceso: number;
  finalizados: number;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useTicketStats = (): TicketStats => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: TicketListResponse = await ticketService.getTickets();
      setTickets(response.data || []);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
      setError(error.message);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshTrigger]);

  const refreshStats = useCallback(async () => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Memoizar el cálculo de estadísticas
  const stats = useMemo(() => {
    const total = tickets.length;
    
    // Optimizar el filtrado usando reduce en una sola pasada
    const { enProceso, finalizados } = tickets.reduce(
      (acc, ticket) => {
        const estatus = ticket.attributes?.estatus;
        if (estatus === "En proceso") {
          acc.enProceso++;
        } else if (estatus === "Finalizado") {
          acc.finalizados++;
        }
        return acc;
      },
      { enProceso: 0, finalizados: 0 }
    );

    return {
      total,
      enProceso,
      finalizados,
      isLoading,
      error,
      refreshStats,
    };
  }, [tickets, isLoading, error, refreshStats]);

  return stats;
};

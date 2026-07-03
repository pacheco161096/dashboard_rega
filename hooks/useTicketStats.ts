import { useState, useEffect, useMemo, useCallback } from "react";
import { ticketService } from "@/lib/ticketService";
import { TicketItem, TicketListResponse } from "@/types/ticket";

interface TicketStats {
  total: number;
  enProceso: number;
  finalizados: number;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useTicketStats = (): TicketStats => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: TicketListResponse = await ticketService.getTickets();
      setTickets(response.data || []);
    } catch (err: unknown) {
      console.error("Error al cargar estadísticas:", err);
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas");
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshTrigger]);

  const refreshStats = useCallback(async () => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const stats = useMemo(() => {
    const total = tickets.length;

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

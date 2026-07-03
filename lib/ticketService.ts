import { businessApi, handleApiError } from "@/lib/api/config";
import { TicketRequest, TicketResponse, TicketListResponse } from "@/types/ticket";

export class TicketService {
  private static instance: TicketService;

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  async createTicket(ticketData: TicketRequest): Promise<TicketResponse> {
    try {
      const response = await businessApi.post<TicketResponse>("/tickets", ticketData);
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error);
    }
  }

  async getTickets(): Promise<TicketListResponse> {
    try {
      const response = await businessApi.get<TicketListResponse>("/tickets?populate=*");
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error);
    }
  }

  async getTicketById(id: number): Promise<TicketResponse> {
    try {
      const response = await businessApi.get<TicketResponse>(`/tickets/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error);
    }
  }

  async updateTicket(id: number, ticketData: TicketRequest): Promise<TicketResponse> {
    try {
      const response = await businessApi.put<TicketResponse>(`/tickets/${id}`, ticketData);
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error);
    }
  }
}

export const ticketService = TicketService.getInstance();

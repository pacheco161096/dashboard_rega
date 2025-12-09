import axios from 'axios';
import { TicketRequest, TicketResponse, TicketListResponse } from '@/types/ticket';

const API_BASE_URL = 'https://monkfish-app-2et8k.ondigitalocean.app/api';

export class TicketService {
  private static instance: TicketService;
  private axiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos de timeout
    });

    // Interceptor para manejar errores globalmente
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Error en la petición:', error);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  /**
   * Crea un nuevo ticket
   * @param ticketData - Datos del ticket a crear
   * @returns Promise con la respuesta de la API
   */
  async createTicket(ticketData: TicketRequest): Promise<TicketResponse> {
    try {
      const response = await this.axiosInstance.post<TicketResponse>('/tickets', ticketData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene todos los tickets
   * @returns Promise con la lista de tickets
   */
  async getTickets(): Promise<TicketListResponse> {
    try {
      const response = await this.axiosInstance.get<TicketListResponse>('/tickets');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene un ticket específico por ID
   * @param id - ID del ticket
   * @returns Promise con el ticket
   */
  async getTicketById(id: number): Promise<TicketResponse> {
    try {
      const response = await this.axiosInstance.get<TicketResponse>(`/tickets/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Maneja los errores de la API de manera consistente
   * @param error - Error de Axios
   * @returns Error personalizado
   */
  private handleError(error: any): Error {
    let errorMessage = 'Error desconocido';

    if (error.response) {
      // Error de respuesta del servidor
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = 'Datos inválidos enviados al servidor';
          break;
        case 401:
          errorMessage = 'No autorizado para realizar esta acción';
          break;
        case 403:
          errorMessage = 'Acceso prohibido';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = data?.error || `Error ${status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Error de red
      errorMessage = 'Error de conexión. Verifique su conexión a internet.';
    } else {
      // Error de configuración
      errorMessage = error.message || 'Error de configuración';
    }

    return new Error(errorMessage);
  }
}

// Exportar una instancia singleton
export const ticketService = TicketService.getInstance(); 
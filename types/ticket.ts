export interface TicketFormData {
  fecha: string;
  id_cliente: string;
  estatus: string;
  id_tecnico: string;
  descripcion: string;
}

export interface TicketActualizacion {
  id?: number;
  fecha: string;
  descripcion: string;
}

export interface TicketData {
  fecha: string;
  id_cliente: number;
  estatus: string;
  id_tecnico: number | null;
  actualizacion?: TicketActualizacion[];
  /** Campo pendiente en la API — preparado para cuando el backend lo soporte */
  reasignado?: boolean;
}

export interface TicketRequest {
  data: TicketData;
}

export interface TicketAttributes {
  fecha: string;
  id_cliente: string;
  estatus: string;
  id_tecnico: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  actualizacion?: TicketActualizacion[];
  /** Campo pendiente en la API — preparado para cuando el backend lo soporte */
  reasignado?: boolean;
}

export interface TicketItem {
  id: number;
  attributes: TicketAttributes;
}

export interface TicketResponse {
  data: {
    id: number;
    attributes: {
      fecha: string;
      id_cliente: string;
      estatus: string;
      id_tecnico: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
  };
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface TicketListResponse {
  data: TicketItem[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
} 
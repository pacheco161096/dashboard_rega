import { businessApi, handleApiError } from "@/lib/api/config";
import {
  ESTADO_SERVICIO_API_HABILITADO,
  filterMatchesServiceStatus,
  ServiceStatusFilter,
} from "@/lib/utils/customerServiceStatus";

export type { ServiceStatusFilter } from "@/lib/utils/customerServiceStatus";

/** Campos mínimos para la tabla de clientes (~75% menos payload que populate=*) */
const LIST_FIELDS_BASE = [
  "id",
  "nombre",
  "apellido",
  "email",
  "celular",
  "localidad",
  "tipo_servicio_paquete",
  "estatus_servicio",
] as const;

const LIST_FIELDS = ESTADO_SERVICIO_API_HABILITADO
  ? ([...LIST_FIELDS_BASE, "estado_servicio"] as const)
  : LIST_FIELDS_BASE;

export interface CustomerListItem {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  localidad: string;
  tipo_servicio_paquete: string;
  estatus_servicio: boolean;
  /** Campo futuro: 'activo' | 'suspendido' | 'cancelado' */
  estado_servicio?: string | null;
  calle?: string;
  num_exterior?: string;
  num_interior?: string;
  colonia?: string;
  ciudad?: string;
}

export interface FetchCustomersParams {
  statusFilter?: ServiceStatusFilter;
  search?: string;
}

function appendListFields(params: URLSearchParams) {
  LIST_FIELDS.forEach((field, index) => {
    params.append(`fields[${index}]`, field);
  });
}

function appendStatusFilter(params: URLSearchParams, statusFilter: ServiceStatusFilter) {
  if (statusFilter === "todos") return;

  if (statusFilter === "cancelados") {
    if (ESTADO_SERVICIO_API_HABILITADO) {
      params.append("filters[estado_servicio][$eq]", "cancelado");
    }
    return;
  }

  if (ESTADO_SERVICIO_API_HABILITADO) {
    const estado = statusFilter === "activos" ? "activo" : "suspendido";
    params.append("filters[estado_servicio][$eq]", estado);
    return;
  }

  if (statusFilter === "activos") {
    params.append("filters[estatus_servicio][$eq]", "true");
  } else if (statusFilter === "inactivos") {
    params.append("filters[estatus_servicio][$eq]", "false");
  }
}

function appendSearchFilter(params: URLSearchParams, search: string) {
  const term = search.trim();
  if (!term) return;

  if (/^\d+$/.test(term)) {
    params.append("filters[$or][0][id][$eq]", term);
    params.append("filters[$or][1][nombre][$containsi]", term);
    params.append("filters[$or][2][apellido][$containsi]", term);
    params.append("filters[$or][3][email][$containsi]", term);
    params.append("filters[$or][4][celular][$containsi]", term);
    return;
  }

  params.append("filters[$or][0][nombre][$containsi]", term);
  params.append("filters[$or][1][apellido][$containsi]", term);
  params.append("filters[$or][2][email][$containsi]", term);
  params.append("filters[$or][3][celular][$containsi]", term);
}

function buildCustomersQuery(params: FetchCustomersParams): string {
  const query = new URLSearchParams();
  appendListFields(query);
  appendStatusFilter(query, params.statusFilter ?? "todos");
  appendSearchFilter(query, params.search ?? "");
  return query.toString();
}

function buildCustomersByIdsQuery(ids: string[]): string {
  const query = new URLSearchParams();
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  uniqueIds.forEach((id, index) => {
    query.append(`filters[id][$in][${index}]`, id);
  });

  query.append("fields[0]", "id");
  query.append("fields[1]", "nombre");
  query.append("fields[2]", "apellido");
  query.append("fields[3]", "email");
  query.append("fields[4]", "celular");
  query.append("fields[5]", "calle");
  query.append("fields[6]", "num_exterior");
  query.append("fields[7]", "num_interior");
  query.append("fields[8]", "colonia");
  query.append("fields[9]", "ciudad");

  return query.toString();
}

function applyClientStatusFilter(
  customers: CustomerListItem[],
  statusFilter: ServiceStatusFilter
): CustomerListItem[] {
  if (statusFilter === "todos") return customers;
  return customers.filter((customer) => filterMatchesServiceStatus(customer, statusFilter));
}

export class CustomersService {
  /**
   * Lista clientes con filtros en servidor (estatus + búsqueda) y campos mínimos.
   * Refinamiento en cliente para separar Cancelado de Suspendido cuando la API lo soporte.
   */
  static async fetchCustomersList(params: FetchCustomersParams = {}): Promise<CustomerListItem[]> {
    const statusFilter = params.statusFilter ?? "todos";

    if (statusFilter === "cancelados" && !ESTADO_SERVICIO_API_HABILITADO) {
      return [];
    }

    try {
      const query = buildCustomersQuery(params);
      const response = await businessApi.get<CustomerListItem[]>(`/users?${query}`);
      const customers = Array.isArray(response.data) ? response.data : [];
      return applyClientStatusFilter(customers, statusFilter);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /** Obtiene solo los clientes necesarios para tickets (por IDs referenciados). */
  static async fetchCustomersByIds(ids: string[]): Promise<CustomerListItem[]> {
    if (ids.length === 0) return [];

    try {
      const query = buildCustomersByIdsQuery(ids);
      const response = await businessApi.get<CustomerListItem[]>(`/users?${query}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const customersService = CustomersService;

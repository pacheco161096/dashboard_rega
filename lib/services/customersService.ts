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
  /**
   * Solo busca por id, nombre y apellido.
   * Útil en selectores de cliente para evitar falsos positivos por email/celular.
   */
  identitySearchOnly?: boolean;
  /** Página (1-based). Si se omite, no se envía paginación al API. */
  page?: number;
  /** Tamaño de página. Requiere `page`. */
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface CustomersListResult {
  data: CustomerListItem[];
  pagination: PaginationMeta;
  /**
   * true cuando la API devolvió más registros que pageSize (ignoró paginación).
   * El FE debe cachear la lista completa y paginar en cliente.
   */
  usedClientPagination?: boolean;
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

function appendSearchFilter(
  params: URLSearchParams,
  search: string,
  identitySearchOnly = false
) {
  const term = search.trim();
  if (!term) return;

  // Búsqueda por identidad: solo id / nombre / apellido (sin email ni celular).
  // El filtrado parcial fino se aplica en cliente con matchesCustomerIdentitySearch.
  if (identitySearchOnly) {
    if (/^\d+$/.test(term)) {
      // Sin filtro de API por ID parcial (Strapi no soporta bien "contains" en enteros).
      return;
    }

    params.append("filters[$or][0][nombre][$containsi]", term);
    params.append("filters[$or][1][apellido][$containsi]", term);
    return;
  }

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

/** Coincidencia parcial por id (números) o nombre/apellido (texto). */
export function matchesCustomerIdentitySearch(
  customer: CustomerListItem,
  search: string
): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  const idStr = String(customer.id);
  const nombre = (customer.nombre ?? "").toLowerCase();
  const apellido = (customer.apellido ?? "").toLowerCase();
  const fullName = `${nombre} ${apellido}`.trim();

  if (/^\d+$/.test(term)) {
    return idStr.includes(term);
  }

  return (
    nombre.includes(term) ||
    apellido.includes(term) ||
    fullName.includes(term)
  );
}

/**
 * Orden de relevancia: coincidencia exacta, luego prefijo, luego contiene.
 * Menor número = más relevante.
 */
export function rankCustomerIdentityMatch(
  customer: CustomerListItem,
  search: string
): number {
  const term = search.trim().toLowerCase();
  if (!term) return 0;

  const idStr = String(customer.id);
  const nombre = (customer.nombre ?? "").toLowerCase();
  const apellido = (customer.apellido ?? "").toLowerCase();
  const fullName = `${nombre} ${apellido}`.trim();

  if (/^\d+$/.test(term)) {
    if (idStr === term) return 0;
    if (idStr.startsWith(term)) return 1;
    return 2;
  }

  if (nombre === term || apellido === term || fullName === term) return 0;
  if (
    nombre.startsWith(term) ||
    apellido.startsWith(term) ||
    fullName.startsWith(term)
  ) {
    return 1;
  }
  return 2;
}

export function filterCustomersByIdentitySearch(
  customers: CustomerListItem[],
  search: string,
  limit = 12
): CustomerListItem[] {
  const term = search.trim();
  if (!term) return [];

  return customers
    .filter((customer) => matchesCustomerIdentitySearch(customer, term))
    .sort((a, b) => {
      const rankDiff =
        rankCustomerIdentityMatch(a, term) - rankCustomerIdentityMatch(b, term);
      if (rankDiff !== 0) return rankDiff;
      return a.id - b.id;
    })
    .slice(0, limit);
}

function appendPagination(params: URLSearchParams, page?: number, pageSize?: number) {
  if (page == null || pageSize == null) return;
  // Strapi content-API
  params.append("pagination[page]", String(page));
  params.append("pagination[pageSize]", String(pageSize));
  params.append("pagination[withCount]", "true");
  // Users-permissions / APIs que usan start-limit
  const start = (page - 1) * pageSize;
  params.append("_start", String(start));
  params.append("_limit", String(pageSize));
  params.append("start", String(start));
  params.append("limit", String(pageSize));
}

function buildCustomersQuery(params: FetchCustomersParams): string {
  const query = new URLSearchParams();
  appendListFields(query);
  appendStatusFilter(query, params.statusFilter ?? "todos");
  appendSearchFilter(query, params.search ?? "", params.identitySearchOnly);
  appendPagination(query, params.page, params.pageSize);
  return query.toString();
}

function parseCustomersResponse(
  body: unknown,
  requestedPage: number,
  requestedPageSize: number | undefined
): CustomersListResult {
  let customers: CustomerListItem[] = [];
  let pagination: PaginationMeta | null = null;

  if (Array.isArray(body)) {
    customers = body;
  } else if (body && typeof body === "object") {
    const obj = body as {
      data?: CustomerListItem[] | { id: number }[];
      meta?: { pagination?: Partial<PaginationMeta> };
    };

    if (Array.isArray(obj.data)) {
      customers = obj.data as CustomerListItem[];
    }

    const meta = obj.meta?.pagination;
    if (meta && typeof meta.total === "number") {
      const pageSize = meta.pageSize ?? requestedPageSize ?? customers.length;
      const total = meta.total;
      pagination = {
        page: meta.page ?? requestedPage,
        pageSize,
        pageCount: meta.pageCount ?? Math.max(1, Math.ceil(total / Math.max(pageSize, 1))),
        total,
      };
    }
  }

  if (!pagination) {
    const pageSize = requestedPageSize ?? customers.length;
    const page = requestedPage;
    // Sin meta: si la página viene llena, asumimos que puede haber más
    const hasMore = requestedPageSize != null && customers.length >= requestedPageSize;
    const total = hasMore
      ? page * pageSize + 1
      : (page - 1) * (pageSize || customers.length) + customers.length;
    const pageCount = hasMore ? page + 1 : Math.max(1, page);

    pagination = {
      page,
      pageSize: pageSize || customers.length || 10,
      pageCount,
      total,
    };
  }

  return { data: customers, pagination };
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
   * Si se envían `page` y `pageSize`, pagina en servidor.
   */
  static async fetchCustomersList(
    params: FetchCustomersParams = {}
  ): Promise<CustomersListResult> {
    const statusFilter = params.statusFilter ?? "todos";
    const page = params.page ?? 1;
    const pageSize = params.pageSize;

    if (statusFilter === "cancelados" && !ESTADO_SERVICIO_API_HABILITADO) {
      return {
        data: [],
        pagination: { page: 1, pageSize: pageSize ?? 10, pageCount: 1, total: 0 },
      };
    }

    try {
      const query = buildCustomersQuery(params);
      const response = await businessApi.get<unknown>(`/users?${query}`);
      const parsed = parseCustomersResponse(response.data, page, pageSize);
      const statusFiltered = applyClientStatusFilter(parsed.data, statusFilter);

      if (params.identitySearchOnly && params.search?.trim()) {
        const limited = filterCustomersByIdentitySearch(statusFiltered, params.search);
        return {
          data: limited,
          pagination: {
            page: 1,
            pageSize: limited.length,
            pageCount: 1,
            total: limited.length,
          },
        };
      }

      // La API ignoró la paginación y devolvió el listado completo
      if (pageSize != null && statusFiltered.length > pageSize) {
        return {
          data: statusFiltered,
          pagination: {
            page,
            pageSize,
            pageCount: Math.max(1, Math.ceil(statusFiltered.length / pageSize)),
            total: statusFiltered.length,
          },
          usedClientPagination: true,
        };
      }

      return {
        data: statusFiltered,
        pagination: parsed.pagination,
        usedClientPagination: false,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /** Obtiene solo los clientes necesarios para tickets (por IDs referenciados). */
  static async fetchCustomersByIds(ids: string[]): Promise<CustomerListItem[]> {
    if (ids.length === 0) return [];

    try {
      const query = buildCustomersByIdsQuery(ids);
      const response = await businessApi.get<unknown>(`/users?${query}`);
      const parsed = parseCustomersResponse(response.data, 1, undefined);
      return parsed.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /** Elimina un cliente (colección users). */
  static async deleteCustomer(id: number): Promise<void> {
    try {
      await businessApi.delete(`/users/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const customersService = CustomersService;

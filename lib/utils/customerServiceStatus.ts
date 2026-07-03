/**
 * Estatus de servicio del cliente.
 *
 * Hoy la API usa `estatus_servicio` (boolean): true = Activo, false = Suspendido.
 * Próximamente: `estado_servicio` (enum): 'activo' | 'suspendido' | 'cancelado'.
 *
 * Cambiar ESTADO_SERVICIO_API_HABILITADO a true cuando el backend exponga el campo.
 */
export const ESTADO_SERVICIO_API_HABILITADO = false;

export type ServiceStatus = "activo" | "suspendido" | "cancelado";

export type ServiceStatusFilter = "activos" | "inactivos" | "cancelados" | "todos";

export interface CustomerServiceStatusInput {
  id: number;
  estatus_servicio: boolean;
  /** Campo futuro en la API */
  estado_servicio?: string | null;
}

export const SERVICE_STATUS_FILTERS: { value: ServiceStatusFilter; label: string }[] = [
  { value: "activos", label: "Activos" },
  { value: "inactivos", label: "Inactivos" },
  { value: "cancelados", label: "Cancelados" },
  { value: "todos", label: "Todos" },
];

const ESTADO_SERVICIO_VALUES: ServiceStatus[] = ["activo", "suspendido", "cancelado"];

function normalizeEstadoServicio(value: string | null | undefined): ServiceStatus | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim() as ServiceStatus;
  return ESTADO_SERVICIO_VALUES.includes(normalized) ? normalized : null;
}

/** Resuelve el estatus real del cliente a partir de la respuesta actual o futura de la API. */
export function resolveServiceStatus(customer: CustomerServiceStatusInput): ServiceStatus {
  const fromEnum = normalizeEstadoServicio(customer.estado_servicio);

  if (ESTADO_SERVICIO_API_HABILITADO && fromEnum) {
    return fromEnum;
  }

  // Si el backend ya envía el enum aunque el flag siga en false, respetarlo
  if (fromEnum === "cancelado") {
    return "cancelado";
  }

  return customer.estatus_servicio ? "activo" : "suspendido";
}

export function getServiceStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case "activo":
      return "Activo";
    case "suspendido":
      return "Suspendido";
    case "cancelado":
      return "Cancelado";
  }
}

export function getServiceStatusBadgeClass(status: ServiceStatus): string {
  switch (status) {
    case "activo":
      return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200 font-medium";
    case "suspendido":
      return "bg-red-700 text-white hover:bg-red-800 font-medium";
    case "cancelado":
      return "bg-gray-200 text-gray-800 hover:bg-gray-200 border-gray-400 font-medium";
  }
}

export function getServiceStatusBadgeVariant(
  status: ServiceStatus
): "outline" | "destructive" | "secondary" {
  switch (status) {
    case "activo":
      return "outline";
    case "suspendido":
      return "destructive";
    case "cancelado":
      return "secondary";
  }
}

export function filterMatchesServiceStatus(
  customer: CustomerServiceStatusInput,
  filter: ServiceStatusFilter
): boolean {
  if (filter === "todos") return true;

  const status = resolveServiceStatus(customer);
  if (filter === "activos") return status === "activo";
  if (filter === "inactivos") return status === "suspendido";
  return status === "cancelado";
}

export function filterToServiceStatus(filter: ServiceStatusFilter): ServiceStatus | null {
  if (filter === "activos") return "activo";
  if (filter === "inactivos") return "suspendido";
  if (filter === "cancelados") return "cancelado";
  return null;
}

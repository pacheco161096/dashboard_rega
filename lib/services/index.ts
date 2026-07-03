/**
 * Exportaciones centralizadas de todos los servicios
 */

export { GastoService, gastoService } from "./gastoService";
export { VentaService, ventaService } from "./ventaService";
export { CajaService, cajaService } from "./cajaService";
export { ClienteService, clienteService } from "./clienteService";
export { CustomersService, customersService } from "./customersService";
export type {
  CustomerListItem,
  ServiceStatusFilter,
  FetchCustomersParams,
  CustomersListResult,
  PaginationMeta,
} from "./customersService";
export { RolesPermissionsService, rolesPermissionsService } from "./rolesPermissionsService";

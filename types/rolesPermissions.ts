export type ModuleId = "inicio" | "clientes" | "cobranza" | "reportes" | "usuarios";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type RolePermissionsMap = Record<ModuleId, ModulePermissions>;

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: RolePermissionsMap;
  createdAt: string;
  updatedAt: string;
}

export interface RoleSelectOption {
  id: string | number;
  name: string;
  value: string;
}

export interface FlatPermissions {
  canAccessInicio: boolean;
  canAccessClientes: boolean;
  canAccessCobranza: boolean;
  canAccessReportes: boolean;
  canAccessUsuarios: boolean;
  canCreateClient: boolean;
  canEditClient: boolean;
  canDeleteClient: boolean;
  canCreateTicket: boolean;
  canUpdateTicketStatus: boolean;
  canViewTicketDetails: boolean;
  canCreateReport: boolean;
}

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  actions: PermissionAction[];
}

export interface RolesStorageData {
  roles: RoleDefinition[];
}

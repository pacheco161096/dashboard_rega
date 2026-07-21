import {
  FlatPermissions,
  ModuleDefinition,
  ModuleId,
  ModulePermissions,
  PermissionAction,
  RoleDefinition,
  RolePermissionsMap,
} from "@/types/rolesPermissions";

export const ROLES_PERMISSIONS_API_HABILITADO = false;
export const ROLES_STORAGE_KEY = "dashboard_custom_roles_permissions";

export const SYSTEM_MODULE_DEFINITIONS: ModuleDefinition[] = [
  { id: "inicio", label: "Inicio", actions: ["view"] },
  { id: "clientes", label: "Clientes", actions: ["view", "create", "edit", "delete"] },
  { id: "cobranza", label: "Cobranza", actions: ["view", "create", "edit", "delete"] },
  { id: "reportes", label: "Reportes", actions: ["view", "create", "edit", "delete"] },
  { id: "usuarios", label: "Usuarios", actions: ["view", "create", "edit", "delete"] },
];

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
};

export const SYSTEM_ROLE_IDS = new Set<string>(["1", "2", "3", "4"]);

const DEFAULT_SYSTEM_ROLE_PERMISSIONS: Record<string, FlatPermissions> = {
  "1": {
    canAccessInicio: true,
    canAccessClientes: true,
    canAccessCobranza: true,
    canAccessReportes: true,
    canAccessUsuarios: true,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: true,
    canCreateTicket: true,
    canUpdateTicketStatus: true,
    canViewTicketDetails: true,
    canCreateReport: true,
  },
  "2": {
    canAccessInicio: false,
    canAccessClientes: true,
    canAccessCobranza: false,
    canAccessReportes: true,
    canAccessUsuarios: false,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canCreateTicket: true,
    canUpdateTicketStatus: true,
    canViewTicketDetails: true,
    canCreateReport: true,
  },
  "3": {
    canAccessInicio: false,
    canAccessClientes: true,
    canAccessCobranza: true,
    canAccessReportes: true,
    canAccessUsuarios: false,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: true,
    canCreateTicket: true,
    canUpdateTicketStatus: false,
    canViewTicketDetails: true,
    canCreateReport: true,
  },
  "4": {
    canAccessInicio: false,
    canAccessClientes: false,
    canAccessCobranza: false,
    canAccessReportes: true,
    canAccessUsuarios: false,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canCreateTicket: false,
    canUpdateTicketStatus: true,
    canViewTicketDetails: true,
    canCreateReport: false,
  },
};

const SYSTEM_ROLE_NAMES: Record<string, string> = {
  "1": "Admin",
  "2": "Supervisor",
  "3": "Cajero",
  "4": "Tecnico",
};

export function createEmptyModulePermissions(): ModulePermissions {
  return { view: false, create: false, edit: false, delete: false };
}

export function createEmptyPermissionsMap(): RolePermissionsMap {
  return {
    inicio: createEmptyModulePermissions(),
    clientes: createEmptyModulePermissions(),
    cobranza: createEmptyModulePermissions(),
    reportes: createEmptyModulePermissions(),
    usuarios: createEmptyModulePermissions(),
  };
}

export function flatPermissionsToModuleMap(flat: FlatPermissions): RolePermissionsMap {
  return {
    inicio: {
      view: flat.canAccessInicio,
      create: false,
      edit: false,
      delete: false,
    },
    clientes: {
      view: flat.canAccessClientes,
      create: flat.canCreateClient,
      edit: flat.canEditClient,
      delete: flat.canDeleteClient,
    },
    cobranza: {
      view: flat.canAccessCobranza,
      create: flat.canAccessCobranza,
      edit: flat.canAccessCobranza,
      delete: false,
    },
    reportes: {
      view: flat.canAccessReportes,
      create: flat.canCreateTicket,
      edit: flat.canUpdateTicketStatus,
      delete: false,
    },
    usuarios: {
      view: flat.canAccessUsuarios,
      create: flat.canAccessUsuarios,
      edit: flat.canAccessUsuarios,
      delete: flat.canAccessUsuarios,
    },
  };
}

export function moduleMapToFlatPermissions(modules: RolePermissionsMap): FlatPermissions {
  const moduleView = (id: ModuleId) => modules[id]?.view ?? false;
  const moduleAction = (id: ModuleId, action: PermissionAction) =>
    modules[id]?.[action] ?? false;

  return {
    canAccessInicio: moduleView("inicio"),
    canAccessClientes: moduleView("clientes"),
    canAccessCobranza: moduleView("cobranza"),
    canAccessReportes: moduleView("reportes"),
    canAccessUsuarios: moduleView("usuarios"),
    canCreateClient: moduleAction("clientes", "create"),
    canEditClient: moduleAction("clientes", "edit"),
    canDeleteClient: moduleAction("clientes", "delete"),
    canCreateTicket: moduleAction("reportes", "create"),
    canUpdateTicketStatus: moduleAction("reportes", "edit"),
    canViewTicketDetails: moduleView("reportes"),
    canCreateReport: moduleAction("clientes", "create"),
  };
}

export function createDefaultSystemRoles(): RoleDefinition[] {
  const now = new Date().toISOString();

  return Object.entries(SYSTEM_ROLE_NAMES).map(([roleId, name]) => ({
    id: roleId,
    name,
    description: `Rol del sistema: ${name}`,
    isSystem: true,
    permissions: flatPermissionsToModuleMap(DEFAULT_SYSTEM_ROLE_PERMISSIONS[roleId]),
    createdAt: now,
    updatedAt: now,
  }));
}

export function normalizeModulePermissions(
  permissions: RolePermissionsMap,
  moduleId: ModuleId,
  action: PermissionAction,
  enabled: boolean
): RolePermissionsMap {
  const next = {
    ...permissions,
    [moduleId]: { ...permissions[moduleId] },
  };

  next[moduleId][action] = enabled;

  if (!enabled && action === "view") {
    next[moduleId] = createEmptyModulePermissions();
  }

  if (enabled && action !== "view") {
    next[moduleId].view = true;
  }

  return next;
}

export function isSystemRoleId(roleId: string): boolean {
  return SYSTEM_ROLE_IDS.has(roleId);
}

export function generateCustomRoleId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `custom_${crypto.randomUUID()}`;
  }
  return `custom_${Date.now()}`;
}

// Enumeración de roles del sistema
import { rolesPermissionsService } from "@/lib/services/rolesPermissionsService";
import { moduleMapToFlatPermissions } from "@/lib/utils/rolesPermissionsConfig";
import type { FlatPermissions } from "@/types/rolesPermissions";

export enum UserRole {
  ADMIN = "1",
  SUPERVISOR = "2",
  CAJERO = "3",
  TECNICO = "4",
}

// Mapeo de roles a nombres legibles
export const ROLE_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.SUPERVISOR]: "Supervisor",
  [UserRole.CAJERO]: "Cajero",
  [UserRole.TECNICO]: "Tecnico",
}

/** Nombres de rol que llegan desde la API (`attributes.rol`) → id interno */
const ROLE_NAME_TO_ID: Record<string, UserRole> = {
  admin: UserRole.ADMIN,
  supervisor: UserRole.SUPERVISOR,
  cajero: UserRole.CAJERO,
  tecnico: UserRole.TECNICO,
}

// Array de roles para usar en selects
export const ROLES_ARRAY = [
  { id: 1, name: ROLE_NAMES[UserRole.ADMIN], value: UserRole.ADMIN },
  { id: 2, name: ROLE_NAMES[UserRole.SUPERVISOR], value: UserRole.SUPERVISOR },
  { id: 3, name: ROLE_NAMES[UserRole.CAJERO], value: UserRole.CAJERO },
  { id: 4, name: ROLE_NAMES[UserRole.TECNICO], value: UserRole.TECNICO },
]

function normalizeRoleLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/**
 * Resuelve el id de rol a partir de la respuesta de usuarios.
 * La API envía `attributes.rol` como nombre: "Admin" | "Supervisor" | "Cajero" | "Tecnico".
 * También acepta ids ("1".."4") y roles personalizados (string id).
 */
export function resolveRoleId(raw: unknown): string | null {
  if (raw == null || raw === "") return null

  if (typeof raw === "object") {
    const obj = raw as {
      data?: { id?: number | string; attributes?: { name?: string; rol?: string } }
      id?: number | string
      name?: string
      rol?: string
    }

    if (obj.data?.id != null) return resolveRoleId(obj.data.id)
    if (obj.data?.attributes?.name) return resolveRoleId(obj.data.attributes.name)
    if (obj.data?.attributes?.rol) return resolveRoleId(obj.data.attributes.rol)
    if (obj.id != null) return resolveRoleId(obj.id)
    if (obj.name) return resolveRoleId(obj.name)
    if (obj.rol) return resolveRoleId(obj.rol)
    return null
  }

  const asString = String(raw).trim()
  if (!asString) return null

  if (
    asString === UserRole.ADMIN ||
    asString === UserRole.SUPERVISOR ||
    asString === UserRole.CAJERO ||
    asString === UserRole.TECNICO
  ) {
    return asString
  }

  const byName = ROLE_NAME_TO_ID[normalizeRoleLabel(asString)]
  if (byName) return byName

  // Rol personalizado u otro id conocido en el servicio local
  return asString
}

export function getRoleDisplayName(roleId: string | null | undefined): string {
  if (!roleId) return "Sin rol"
  if (roleId in ROLE_NAMES) return ROLE_NAMES[roleId as UserRole]
  if (typeof window !== "undefined") {
    const custom = rolesPermissionsService.getRoleById(roleId)
    if (custom?.name) return custom.name
  }
  return roleId
}

/** Permiso requerido por ruta del dashboard */
export const ROUTE_ACCESS_PERMISSION: Record<string, keyof FlatPermissions> = {
  "/dashboard": "canAccessInicio",
  "/dashboard/customers": "canAccessClientes",
  "/dashboard/cobranza": "canAccessCobranza",
  "/dashboard/reportes": "canAccessReportes",
  "/dashboard/usuarios": "canAccessUsuarios",
}

export function getRoutePermissionKey(pathname: string): keyof FlatPermissions | null {
  if (ROUTE_ACCESS_PERMISSION[pathname]) {
    return ROUTE_ACCESS_PERMISSION[pathname]
  }

  const match = Object.keys(ROUTE_ACCESS_PERMISSION)
    .filter((route) => route !== "/dashboard" && pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0]

  return match ? ROUTE_ACCESS_PERMISSION[match] : null
}

// Función para obtener el rol del usuario desde sessionStorage
export function getUserRole(): string | null {
  if (typeof window === "undefined") return null

  try {
    const loginUser = sessionStorage.getItem("loginUser")
    if (!loginUser) return null

    const user = JSON.parse(loginUser)
    return resolveRoleId(user.role) || resolveRoleId(user.roleName) || null
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error)
    return null
  }
}

// Función para verificar si el usuario tiene un rol específico
export function hasRole(role: UserRole | string): boolean {
  const userRole = getUserRole()
  return userRole === role
}

// Función para verificar si el usuario tiene alguno de los roles especificados
export function hasAnyRole(...roles: Array<UserRole | string>): boolean {
  const userRole = getUserRole()
  return userRole !== null && roles.includes(userRole)
}

// Permisos por rol
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: {
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
  [UserRole.SUPERVISOR]: {
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
    canCreateReport: true, // Solo puede crear reporte desde Clientes
  },
  [UserRole.CAJERO]: {
    canAccessInicio: false,
    canAccessClientes: true,
    canAccessCobranza: true,
    canAccessReportes: true,
    canAccessUsuarios: false,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: true,
    canCreateTicket: true,
    canUpdateTicketStatus: false, // No puede actualizar estatus ni guardar comentario
    canViewTicketDetails: true,
    canCreateReport: true,
  },
  [UserRole.TECNICO]: {
    canAccessInicio: false,
    canAccessClientes: false,
    canAccessCobranza: false,
    canAccessReportes: true,
    canAccessUsuarios: false,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canCreateTicket: false, // No puede ver el card de crear ticket
    canUpdateTicketStatus: true,
    canViewTicketDetails: true,
    canCreateReport: false,
  },
}

// Función para obtener los permisos del usuario actual
export function getUserPermissions(): FlatPermissions | null {
  const userRole = getUserRole()
  if (!userRole) return null

  if (typeof window !== "undefined") {
    const roleDefinition = rolesPermissionsService.getRoleById(userRole)
    if (roleDefinition) {
      return moduleMapToFlatPermissions(roleDefinition.permissions)
    }
  }

  return ROLE_PERMISSIONS[userRole as UserRole] || null
}

export function getAllRolesForSelect() {
  if (typeof window === "undefined") {
    return ROLES_ARRAY.map((role) => ({
      id: role.id,
      name: role.name,
      value: role.value,
    }))
  }

  return rolesPermissionsService.getRolesForSelect()
}

// Función para obtener la ruta de redirección después del login según el rol
export function getRedirectPathByRole(role: string | null): string {
  if (!role) return "/dashboard/customers"

  switch (role) {
    case UserRole.SUPERVISOR:
    case UserRole.CAJERO:
      return "/dashboard/customers"
    case UserRole.TECNICO:
      return "/dashboard/reportes"
    case UserRole.ADMIN:
      return "/dashboard"
    default: {
      // Roles personalizados: primera ruta permitida según permisos
      const permissions =
        typeof window !== "undefined"
          ? (() => {
              const def = rolesPermissionsService.getRoleById(role)
              return def ? moduleMapToFlatPermissions(def.permissions) : null
            })()
          : null

      if (permissions?.canAccessInicio) return "/dashboard"
      if (permissions?.canAccessClientes) return "/dashboard/customers"
      if (permissions?.canAccessReportes) return "/dashboard/reportes"
      if (permissions?.canAccessCobranza) return "/dashboard/cobranza"
      if (permissions?.canAccessUsuarios) return "/dashboard/usuarios"
      return "/dashboard/customers"
    }
  }
}

/** Primera ruta permitida para el usuario autenticado actual */
export function getDefaultAllowedPath(): string {
  return getRedirectPathByRole(getUserRole())
}

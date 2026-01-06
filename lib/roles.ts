// Enumeración de roles del sistema
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

// Array de roles para usar en selects
export const ROLES_ARRAY = [
  { id: 1, name: ROLE_NAMES[UserRole.ADMIN], value: UserRole.ADMIN },
  { id: 2, name: ROLE_NAMES[UserRole.SUPERVISOR], value: UserRole.SUPERVISOR },
  { id: 3, name: ROLE_NAMES[UserRole.CAJERO], value: UserRole.CAJERO },
  { id: 4, name: ROLE_NAMES[UserRole.TECNICO], value: UserRole.TECNICO },
]

// Función para obtener el rol del usuario desde sessionStorage
export function getUserRole(): UserRole | null {
  if (typeof window === "undefined") return null
  
  try {
    const loginUser = sessionStorage.getItem("loginUser")
    if (!loginUser) return null
    
    const user = JSON.parse(loginUser)
    return user.role as UserRole || null
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error)
    return null
  }
}

// Función para verificar si el usuario tiene un rol específico
export function hasRole(role: UserRole): boolean {
  const userRole = getUserRole()
  return userRole === role
}

// Función para verificar si el usuario tiene alguno de los roles especificados
export function hasAnyRole(...roles: UserRole[]): boolean {
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
export function getUserPermissions() {
  const userRole = getUserRole()
  if (!userRole) return null
  return ROLE_PERMISSIONS[userRole] || null
}

// Función para obtener la ruta de redirección después del login según el rol
export function getRedirectPathByRole(role: UserRole | null): string {
  if (!role) return "/dashboard"
  
  switch (role) {
    case UserRole.SUPERVISOR:
    case UserRole.CAJERO:
      return "/dashboard/customers"
    case UserRole.TECNICO:
      return "/dashboard/reportes"
    case UserRole.ADMIN:
    default:
      return "/dashboard"
  }
}

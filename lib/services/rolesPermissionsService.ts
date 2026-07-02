import {
  createDefaultSystemRoles,
  createEmptyPermissionsMap,
  generateCustomRoleId,
  isSystemRoleId,
  ROLES_PERMISSIONS_API_HABILITADO,
  ROLES_STORAGE_KEY,
} from "@/lib/utils/rolesPermissionsConfig";
import { RoleDefinition, RolePermissionsMap, RoleSelectOption, RolesStorageData } from "@/types/rolesPermissions";

function readStorage(): RolesStorageData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RolesStorageData) : null;
  } catch {
    return null;
  }
}

function writeStorage(data: RolesStorageData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(data));
}

function mergeWithSystemDefaults(storedRoles: RoleDefinition[]): RoleDefinition[] {
  const defaults = createDefaultSystemRoles();
  const storedMap = new Map(storedRoles.map((role) => [role.id, role]));

  const mergedSystem = defaults.map((defaultRole) => {
    const stored = storedMap.get(defaultRole.id);
    if (!stored) return defaultRole;
    return {
      ...defaultRole,
      ...stored,
      isSystem: true,
      name: defaultRole.name,
    };
  });

  const customRoles = storedRoles.filter((role) => !role.isSystem && !isSystemRoleId(role.id));
  return [...mergedSystem, ...customRoles];
}

function ensureStorage(): RolesStorageData {
  const existing = readStorage();
  if (existing?.roles?.length) {
    return { roles: mergeWithSystemDefaults(existing.roles) };
  }

  const seeded: RolesStorageData = { roles: createDefaultSystemRoles() };
  writeStorage(seeded);
  return seeded;
}

export class RolesPermissionsService {
  static getAllRoles(): RoleDefinition[] {
    return ensureStorage().roles;
  }

  static getRoleById(roleId: string): RoleDefinition | null {
    return this.getAllRoles().find((role) => role.id === roleId) ?? null;
  }

  static getRolesForSelect(): RoleSelectOption[] {
    return this.getAllRoles().map((role) => ({
      id: role.isSystem ? Number(role.id) : role.id,
      name: role.name,
      value: role.id,
    }));
  }

  static createRole(input: {
    name: string;
    description?: string;
    permissions?: RolePermissionsMap;
  }): RoleDefinition {
    if (ROLES_PERMISSIONS_API_HABILITADO) {
      throw new Error("La creación de roles vía API aún no está habilitada.");
    }

    const now = new Date().toISOString();
    const role: RoleDefinition = {
      id: generateCustomRoleId(),
      name: input.name.trim(),
      description: input.description?.trim() || "",
      isSystem: false,
      permissions: input.permissions ?? createEmptyPermissionsMap(),
      createdAt: now,
      updatedAt: now,
    };

    const data = ensureStorage();
    data.roles.push(role);
    writeStorage(data);
    return role;
  }

  static updateRole(
    roleId: string,
    input: { name?: string; description?: string; permissions?: RolePermissionsMap }
  ): RoleDefinition {
    const data = ensureStorage();
    const index = data.roles.findIndex((role) => role.id === roleId);
    if (index === -1) {
      throw new Error("Rol no encontrado.");
    }

    const current = data.roles[index];
    const updated: RoleDefinition = {
      ...current,
      description: input.description !== undefined ? input.description : current.description,
      permissions: input.permissions ?? current.permissions,
      updatedAt: new Date().toISOString(),
    };

    if (current.isSystem) {
      updated.name = current.name;
    } else if (input.name?.trim()) {
      updated.name = input.name.trim();
    }

    data.roles[index] = updated;
    writeStorage({ roles: mergeWithSystemDefaults(data.roles) });
    return updated;
  }

  static deleteRole(roleId: string): void {
    if (isSystemRoleId(roleId)) {
      throw new Error("Los roles del sistema no se pueden eliminar.");
    }

    if (ROLES_PERMISSIONS_API_HABILITADO) {
      throw new Error("La eliminación de roles vía API aún no está habilitada.");
    }

    const data = ensureStorage();
    data.roles = data.roles.filter((role) => role.id !== roleId);
    writeStorage({ roles: mergeWithSystemDefaults(data.roles) });
  }

  static resetSystemRole(roleId: string): RoleDefinition {
    if (!isSystemRoleId(roleId)) {
      throw new Error("Solo se pueden restablecer roles del sistema.");
    }

    const defaults = createDefaultSystemRoles();
    const defaultRole = defaults.find((role) => role.id === roleId);
    if (!defaultRole) {
      throw new Error("Rol del sistema no encontrado.");
    }

    const data = ensureStorage();
    const index = data.roles.findIndex((role) => role.id === roleId);
    if (index === -1) {
      data.roles.push(defaultRole);
    } else {
      data.roles[index] = defaultRole;
    }

    writeStorage({ roles: mergeWithSystemDefaults(data.roles) });
    return defaultRole;
  }
}

export const rolesPermissionsService = RolesPermissionsService;

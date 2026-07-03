"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PencilIcon, TrashIcon, PlusIcon, ShieldIcon } from "@primer/octicons-react";
import { Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { rolesPermissionsService } from "@/lib/services/rolesPermissionsService";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal/ConfirmActionModal";
import {
  ACTION_LABELS,
  createEmptyPermissionsMap,
  normalizeModulePermissions,
  ROLES_PERMISSIONS_API_HABILITADO,
  SYSTEM_MODULE_DEFINITIONS,
} from "@/lib/utils/rolesPermissionsConfig";
import {
  ModuleId,
  PermissionAction,
  RoleDefinition,
  RolePermissionsMap,
} from "@/types/rolesPermissions";
import {
  firstFieldErrorMessage,
  hasFieldErrors,
  validateRoleForm,
  type FieldErrors,
} from "@/lib/utils/formValidation";

export function RolesPermissionsManager() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: createEmptyPermissionsMap(),
  });

  const loadRoles = useCallback(() => {
    setLoading(true);
    try {
      setRoles(rolesPermissionsService.getAllRoles());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const isEditing = selectedRole !== null;

  const requireName = !selectedRole?.isSystem;

  const isFormComplete = useMemo(
    () =>
      !hasFieldErrors(
        validateRoleForm(formData, { requireName })
      ),
    [formData, requireName]
  );

  const clearFieldError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      permissions: createEmptyPermissionsMap(),
    });
    setFormErrors({});
    setSelectedRole(null);
  }, []);

  const openCreateModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = (role: RoleDefinition) => {
    setSelectedRole(role);
    setFormErrors({});
    setFormData({
      name: role.name,
      description: role.description,
      permissions: structuredClone(role.permissions),
    });
    setShowFormModal(true);
  };

  const handlePermissionChange = (
    moduleId: ModuleId,
    action: PermissionAction,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: normalizeModulePermissions(prev.permissions, moduleId, action, checked),
    }));
    clearFieldError("permissions");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateRoleForm(formData, { requireName });
    if (hasFieldErrors(validationErrors)) {
      setFormErrors(validationErrors);
      toast({
        title: "Formulario incompleto",
        description: firstFieldErrorMessage(validationErrors),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && selectedRole) {
        rolesPermissionsService.updateRole(selectedRole.id, {
          name: selectedRole.isSystem ? selectedRole.name : formData.name.trim(),
          description: formData.description.trim(),
          permissions: formData.permissions,
        });
        toast({
          title: "Rol actualizado",
          description: `Los permisos de "${selectedRole.name}" se guardaron correctamente.`,
        });
      } else {
        rolesPermissionsService.createRole({
          name: formData.name.trim(),
          description: formData.description.trim(),
          permissions: formData.permissions,
        });
        toast({
          title: "Rol creado",
          description: "El rol personalizado se creó correctamente.",
        });
      }

      setShowFormModal(false);
      resetForm();
      loadRoles();
    } catch (error) {
      toast({
        title: "Error al guardar el rol",
        description: error instanceof Error ? error.message : "No se pudo guardar el rol.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!roleToDelete) return;

    try {
      rolesPermissionsService.deleteRole(roleToDelete.id);
      toast({
        title: "Rol eliminado",
        description: `"${roleToDelete.name}" fue eliminado correctamente.`,
      });
      setShowDeleteModal(false);
      setRoleToDelete(null);
      loadRoles();
    } catch (error) {
      toast({
        title: "No se puede eliminar",
        description: error instanceof Error ? error.message : "Error al eliminar el rol.",
        variant: "destructive",
      });
    }
  };

  const handleResetSystemRole = (role: RoleDefinition) => {
    try {
      rolesPermissionsService.resetSystemRole(role.id);
      toast({
        title: "Rol restablecido",
        description: `"${role.name}" volvió a sus permisos predeterminados.`,
      });
      loadRoles();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo restablecer el rol.",
        variant: "destructive",
      });
    }
  };

  const permissionSummary = useMemo(() => {
    return (permissions: RolePermissionsMap) =>
      SYSTEM_MODULE_DEFINITIONS.filter((module) => permissions[module.id].view).map(
        (module) => module.label
      );
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Roles y permisos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configura qué módulos y acciones puede usar cada rol del sistema.
          </p>
          {ROLES_PERMISSIONS_API_HABILITADO ? (
            <p className="text-xs text-green-600 mt-1">Sincronización con API habilitada.</p>
          ) : (
            <p className="text-xs text-amber-600 mt-1">
              Los cambios se guardan localmente hasta que la API de roles esté disponible.
            </p>
          )}
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 shrink-0">
          <PlusIcon size={16} className="mr-2" />
          Nuevo rol
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => {
            const modules = permissionSummary(role.permissions);
            return (
              <div
                key={role.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <ShieldIcon size={16} className="text-indigo-600 shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{role.name}</h3>
                      {role.isSystem ? (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                          Sistema
                        </Badge>
                      ) : (
                        <Badge variant="outline">Personalizado</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {role.description || "Sin descripción"}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Módulos habilitados
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {modules.length > 0 ? (
                      modules.map((label) => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Sin módulos asignados</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                    onClick={() => openEditModal(role)}
                  >
                    <PencilIcon size={14} className="mr-1" />
                    Editar
                  </Button>

                  {role.isSystem ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetSystemRole(role)}
                      title="Restablecer permisos predeterminados"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restablecer
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                      onClick={() => {
                        setRoleToDelete(role);
                        setShowDeleteModal(true);
                      }}
                    >
                      <TrashIcon size={14} className="mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={showFormModal}
        onOpenChange={(open) => {
          setShowFormModal(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Editar rol: ${selectedRole?.name}` : "Crear nuevo rol"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6" noValidate>
            {!selectedRole?.isSystem && (
              <div className="space-y-2">
                <Label htmlFor="role-name">
                  Nombre del rol <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    clearFieldError("name");
                  }}
                  placeholder="Ej. Gerente de operaciones"
                  className={formErrors.name ? "border-red-500" : ""}
                  aria-invalid={Boolean(formErrors.name)}
                  disabled={isSaving}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600">{formErrors.name}</p>
                )}
              </div>
            )}

            {selectedRole?.isSystem && (
              <div className="rounded-md bg-indigo-50 border border-indigo-200 p-3 text-sm text-indigo-800">
                Los roles del sistema pueden editar permisos, pero no cambiar de nombre ni eliminarse.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role-description">Descripción</Label>
              <Textarea
                id="role-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe el propósito de este rol..."
                rows={2}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-3">
              <Label>
                Permisos por módulo <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-gray-500">
                Debe seleccionar al menos un permiso para guardar el rol.
              </p>
              <div
                className={`border rounded-lg overflow-hidden ${
                  formErrors.permissions ? "border-red-500" : "border-gray-200"
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Módulo</th>
                        {(["view", "create", "edit", "delete"] as PermissionAction[]).map((action) => (
                          <th
                            key={action}
                            className="px-4 py-3 text-center font-semibold text-gray-700"
                          >
                            {ACTION_LABELS[action]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {SYSTEM_MODULE_DEFINITIONS.map((module) => (
                        <tr key={module.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{module.label}</td>
                          {(["view", "create", "edit", "delete"] as PermissionAction[]).map(
                            (action) => {
                              const isSupported = module.actions.includes(action);
                              const checked = formData.permissions[module.id][action];

                              return (
                                <td key={action} className="px-4 py-3 text-center">
                                  {isSupported ? (
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) =>
                                        handlePermissionChange(
                                          module.id,
                                          action,
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                      aria-label={`${module.label} - ${ACTION_LABELS[action]}`}
                                      disabled={isSaving}
                                    />
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                              );
                            }
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {formErrors.permissions && (
                <p className="text-xs text-red-600">{formErrors.permissions}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSaving || !isFormComplete}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : isEditing ? (
                  "Guardar cambios"
                ) : (
                  "Crear rol"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmActionModal
        open={showDeleteModal && !!roleToDelete}
        title="¿Eliminar rol?"
        description={
          <>
            ¿Eliminar el rol <strong>{roleToDelete?.name}</strong>? Los usuarios con este rol
            deberán reasignarse manualmente.
          </>
        }
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setRoleToDelete(null);
        }}
      />
    </div>
  );
}

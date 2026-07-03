export type FieldErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmpty(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function validateRequiredFields(
  data: Record<string, string>,
  fields: { name: string; label: string }[]
): FieldErrors {
  const errors: FieldErrors = {};

  fields.forEach(({ name, label }) => {
    if (!isNonEmpty(data[name])) {
      errors[name] = `${label} es obligatorio`;
    }
  });

  return errors;
}

export function validateCustomerForm(data: Record<string, string>): FieldErrors {
  const errors = validateRequiredFields(data, [
    { name: "nombre", label: "Nombre" },
    { name: "apellido", label: "Apellido" },
    { name: "email", label: "Correo" },
  ]);

  if (isNonEmpty(data.email) && !isValidEmail(data.email)) {
    errors.email = "Ingrese un correo electrónico válido";
  }

  return errors;
}

export function validateTicketForm(data: {
  fecha: string;
  id_cliente: string;
  estatus: string;
  id_tecnico: string;
  descripcion: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!isNonEmpty(data.fecha)) {
    errors.fecha = "La fecha es obligatoria";
  }

  if (!isNonEmpty(data.id_cliente)) {
    errors.id_cliente = "Seleccione un cliente de la lista";
  }

  if (!isNonEmpty(data.estatus)) {
    errors.estatus = "El estatus es obligatorio";
  }

  if (!isNonEmpty(data.id_tecnico)) {
    errors.id_tecnico = "Seleccione un técnico";
  }

  if (!isNonEmpty(data.descripcion)) {
    errors.descripcion = "La descripción es obligatoria";
  } else if (data.descripcion.trim().length < 10) {
    errors.descripcion = "La descripción debe tener al menos 10 caracteres";
  }

  return errors;
}

export function validateUsuarioForm(
  data: {
    nombre: string;
    username: string;
    email: string;
    password: string;
    role: string;
  },
  options: { isEditing: boolean }
): FieldErrors {
  const errors = validateRequiredFields(data, [
    { name: "nombre", label: "Nombre" },
    { name: "username", label: "Usuario" },
    { name: "email", label: "Email" },
    { name: "role", label: "Rol" },
  ]);

  if (isNonEmpty(data.email) && !isValidEmail(data.email)) {
    errors.email = "Ingrese un correo electrónico válido";
  }

  if (!options.isEditing) {
    if (!isNonEmpty(data.password)) {
      errors.password = "La contraseña es obligatoria";
    } else if (data.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }
  } else if (isNonEmpty(data.password) && data.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  return errors;
}

export function countEnabledPermissions(
  permissions: Record<string, Record<string, boolean>>
): number {
  return Object.values(permissions).reduce((total, modulePermissions) => {
    return (
      total + Object.values(modulePermissions).filter(Boolean).length
    );
  }, 0);
}

export function validateRoleForm(
  data: {
    name: string;
    description: string;
    permissions: Record<string, Record<string, boolean>>;
  },
  options: { requireName: boolean }
): FieldErrors {
  const errors: FieldErrors = {};

  if (options.requireName && !isNonEmpty(data.name)) {
    errors.name = "El nombre del rol es obligatorio";
  }

  if (countEnabledPermissions(data.permissions) < 1) {
    errors.permissions = "Seleccione al menos un permiso";
  }

  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function firstFieldErrorMessage(errors: FieldErrors): string {
  const first = Object.values(errors)[0];
  return first || "Complete la información requerida";
}

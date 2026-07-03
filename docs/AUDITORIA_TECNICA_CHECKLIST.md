# Auditoría técnica — Dashboard Regatelecom

> Checklist de seguimiento para deuda técnica, mejoras de flujo, manejo de escenarios y optimización.  
> Basado en la revisión del proyecto (lint/build OK, tests 0%).  
> **Última actualización:** Julio 2026 (incluye avances FE: auth/roles, guards, tickets, APIs centralizadas)

---

## Estado general del proyecto

| Verificación | Estado |
|---|---|
| `npm run lint` | ✅ Sin errores ni warnings |
| `npm run build` | ✅ Compilación exitosa (11 rutas) |
| Tests automatizados | ❌ 0% — no existen |

---

## 1. Lo que falta por terminarse

### 1.1 Crítico / bloqueante para producción

- [x] **Autenticación server-side (parcial FE)**
  - [x] Mover middleware a `middleware.ts` en la raíz
  - [x] Cookie `loginUser` sincronizada con `sessionStorage` (`lib/auth/session.ts`)
  - [x] Proteger todas las rutas `/dashboard/*` en middleware
  - [ ] Cookie httpOnly / JWT real (requiere backend)

- [ ] **Login seguro**
  - [x] Login vía `businessApi` + mapeo de `attributes.rol` (`"Admin"`, `"Cajero"`, `"Tecnico"`, …)
  - [x] Sin fallback a Admin si no hay rol
  - [ ] Cambiar login de GET a POST con body (requiere endpoint de auth)
  - [ ] Eliminar exposición de usuario/contraseña en query (hoy aún GET con params)

- [ ] **RBAC real (control de acceso por roles)**
  - [x] UI de roles y permisos personalizados en `/dashboard/usuarios` (pestaña "Roles y permisos")
  - [x] Roles de sistema editables pero no eliminables; roles custom con CRUD completo
  - [x] Matriz de permisos por módulo (ver, crear, editar, eliminar) integrada con `getUserPermissions()`
  - [x] Guard por página según permisos (`ProtectedRoute` + `ROUTE_ACCESS_PERMISSION`)
  - [x] Bloquear acceso directo por URL a rutas sin permiso
  - [ ] Persistencia solo en `localStorage` — activar API (`ROLES_PERMISSIONS_API_HABILITADO = false`)
  - [ ] Roles personalizados: validar que el backend acepte IDs no numéricos al asignar usuarios

- [x] **Eliminar selector de rol en producción**
  - [x] Quitar selector de rol de pruebas en `InfoClient.tsx`
  - [x] Eliminar fallback automático a Admin cuando el usuario no tiene rol
  - [x] Logout limpia sesión, cookie y estado residual

---

### 1.2 Features a medias

- [x] **Dashboard principal** (`/dashboard`)
  - [x] Bienvenida para Admin; redirect a primera ruta permitida si no tiene `canAccessInicio`

- [x] **Login duplicado** (`/dashboard/login`)
  - [x] Redirige a `/` (login real está en raíz)

- [x] **Cobranza → tab Producto**
  - [x] Tab Producto oculto hasta tener API (solo flujo Paquete)

- [x] **TicketTracker — actualizar ticket**
  - [x] Enviar campo `actualizacion` en el payload al actualizar
  - [x] Persistir reporte del técnico (`updateDescription`) en backend
  - [x] Incluir historial de actualizaciones existentes + nueva entrada

- [x] **TicketTracker — búsqueda y filtros**
  - [x] Búsqueda ampliada: ID ticket, ID cliente, nombre, correo, teléfono, descripción
  - [x] Filtros de ticket en la misma fila del buscador: En Proceso, Finalizados, Todos

- [x] **TicketTracker — técnicos desde API**
  - [x] Cargar técnicos con `UsuariosService.obtenerTecnicos()` (misma fuente que TicketForm)
  - [x] Mostrar nombre del técnico en lugar del ID

- [x] **TicketTracker — reasignación de técnicos**
  - [x] UI de reasignación (select, botón dinámico Reasignar / Cancelar / Guardar con iconos)
  - [x] Bandera visual "Reasignado" (local hasta que API tenga `reasignado`)
  - [x] Persistir `id_tecnico` vía `updateTicket` (API real)
  - [ ] Campo `reasignado` en backend cuando la API lo soporte (badge local mientras tanto)

- [ ] **Clientes — estatus de servicio**
  - [x] Filtros Activos / Inactivos / Cancelados / Todos en la misma fila del buscador
  - [x] Búsqueda por ID, nombre, correo o teléfono
  - [x] Badge reutilizable `ServiceStatusBadge`
  - [x] Preparación para estatus **Cancelado** (`estado_servicio` enum futuro)
  - [ ] Activar `ESTADO_SERVICIO_API_HABILITADO = true` cuando el backend exponga el campo
  - [ ] Verificar filtro Cancelados con datos reales de API

- [x] **RegisterPay** — eliminado (legacy sin uso; pago vive en cobranza)

- [x] **UpdateCustomer** — eliminado (legacy sin uso; edición vía `CustomerForm`)

- [x] **Módulo Almacén**
  - [x] Quitada referencia en `SectionTitle.tsx`

- [x] **Eliminar cliente**
  - [x] Acción con permiso `canDeleteClient` + modal de confirmación (`ConfirmActionModal`)
  - [x] Mismo modal reutilizado en usuarios, roles y cerrar sesión

---

### 1.3 Inconsistencias de backend / APIs

- [x] **Centralizar URLs de API (capa principal)**
  - [x] `customersService` usa `businessApi`
  - [x] `ticketService` usa `businessApi` + `handleApiError`
  - [x] `UsuariosService` usa `businessApi` (login, CRUD, técnicos)
  - [x] `CustomerForm` / `CreateCustomer` usan `businessApi`
  - [ ] Revisar si quedan llamadas axios directas residuales

- [x] **Unificar backend de usuarios/técnicos (FE)**
  - [x] Login / Usuarios / Técnicos / Tickets → BUSINESS API (`monkfish-app`)
  - [ ] Confirmar en backend que `filters[rol][$eq]=Tecnico` es la fuente oficial

- [x] **Alinear operaciones CRUD de usuarios**
  - [x] GET/POST/PUT/DELETE vía `UsuariosService` + `handleApiError`

- [ ] **Roles y permisos — backend**
  - [ ] Implementar endpoints de roles/permisos en API
  - [ ] Activar `ROLES_PERMISSIONS_API_HABILITADO` y migrar de `localStorage` a API
  - [ ] Sincronizar roles custom entre dispositivos/usuarios admin

---

### 1.4 Datos huérfanos en el repositorio

- [ ] Revisar y remover `app/dashboard/clientes.json` (~47k líneas, no usado en runtime)
- [ ] Revisar y remover `app/dashboard/clientesDepurados.json` (~3.7k líneas, no usado en runtime)
- [ ] Verificar que no contengan PII expuesta en el repo
- [ ] Agregar a `.gitignore` si deben conservarse solo en local

---

### 1.5 Testing

- [ ] Configurar framework de tests (Vitest/Jest + Playwright/Cypress)
- [ ] Agregar script `test` en `package.json`
- [ ] Tests E2E: login y redirección por rol
- [ ] Tests E2E: apertura/cierre de caja
- [ ] Tests E2E: flujo de pago (paquete)
- [ ] Tests E2E: CRUD usuarios
- [ ] Tests E2E: crear y actualizar ticket
- [ ] Tests E2E: reasignación de técnico (cuando deje de ser simulación)
- [ ] Tests E2E: filtros de clientes (Activos / Inactivos / Cancelados)
- [ ] Tests E2E: CRUD roles y permisos
- [ ] Tests de permisos por rol (RBAC)

---

## 2. Mejoras de flujo

### 2.1 Autenticación y sesión

- [x] Cookie + sessionStorage sincronizados (`lib/auth/session.ts`)
- [x] `middleware.ts` en raíz validando sesión en `/dashboard/*`
- [x] Guard por página según permisos con redirect
- [x] Logout limpiando sesión, cookie y estado residual
- [x] Eliminar fallback Admin en login
- [ ] Login POST + token/cookie httpOnly (requiere backend)

### 2.2 Flujos de negocio

- [x] **Cliente → Cobranza:** toast si no hay caja abierta; no guarda `selectedUser` sin caja
- [x] **Crear cliente:** password temporal generado (ya no `"123456789"`); `role: "2"` se mantiene como rol Strapi de cliente
- [x] **Crear / seguir ticket:** técnicos desde BUSINESS API
- [x] **Actualizar ticket:** estatus + reporte técnico en `actualizacion`
- [x] **Reasignar técnico:** `id_tecnico` persistido en API
- [x] **Admin post-login:** bienvenida en `/dashboard`
- [x] **Clientes:** filtros de estatus + búsqueda en servidor (debounce 400 ms)
- [ ] **Clientes Cancelado:** activar cuando API soporte `estado_servicio`

### 2.3 Layout y estructura

- [x] Corregir `app/dashboard/layout.tsx` — sin `<html>` / `<body>` anidados

---

## 3. Manejo de escenarios (éxito / error)

### 3.1 Matriz de feedback al usuario

| Módulo | Éxito | Error | Pendiente |
|---|---|---|---|
| Login | ✅ Redirección | ✅ Banner inline | Mensajes más específicos |
| Cobranza (hooks) | ✅ Toast | ✅ Toast destructive | Referencia inválida → return silencioso |
| Usuarios | ✅ Toast | ✅ Toast | — |
| Roles y permisos | ✅ Toast | ✅ Toast | Solo localStorage; sin sync multi-dispositivo |
| Clientes (fetch) | Lista cargada | ✅ Mensaje + reintentar (`fetchError`) | — |
| CustomerForm / CreateCustomer | ✅ Toast | ✅ Toast | — |
| Tickets crear | ✅ Toast + redirige | ✅ Toast + banner | — |
| Tickets stats | Lista | ✅ Banner de error | — |
| TicketTracker update | Banner verde | Inline | Reporte sí se envía |
| TicketTracker reasignación | Banner | Inline | `id_tecnico` en API |
| useVentas | — | ✅ Toast en autoLoad | — |
| useTicketForm / useTicketStats | ✅ Toast / banner | ✅ | — |

### 3.2 Tareas de mejora de feedback

- [x] **Clientes:** mostrar mensaje visible cuando falla el fetch (no solo lista vacía)
- [x] **CustomerForm / CreateCustomer:** toast de éxito y error
- [x] **Cobranza:** avisar al usuario cuando referencia de pago es inválida
- [x] **useVentas:** toast en error de autoLoad
- [x] **useTicketForm / useTicketStats:** toast / banner de error
- [x] **Tickets stats:** indicar al usuario si hubo error al cargar estadísticas
- [x] **TicketTracker update:** solo éxito tras persistir `actualizacion`
- [ ] Unificar patrón de feedback en todo el proyecto (preferir toast Radix) — casi completo

---

### 3.3 Escenarios de prueba manual / E2E

#### Autenticación

- [ ] Login credenciales incorrectas → mensaje claro
- [ ] Acceso directo a `/dashboard/usuarios` sin sesión → redirect a `/`
- [ ] Acceso con rol Cajero a `/dashboard/usuarios` → debe bloquearse
- [ ] Logout → no debe quedar estado residual en sessionStorage / localStorage de sesión
- [ ] Cambiar rol en header → actualmente permite escalación (corregir)

#### Clientes

- [x] API caída → error visible con opción de reintentar
- [ ] Crear cliente → feedback de éxito/error
- [ ] Editar cliente → feedback de éxito/error
- [ ] Cobranza sin caja abierta → mensaje claro, sin navegación rota
- [ ] Filtro Activos / Inactivos / Todos → conteos coherentes con servidor
- [ ] Filtro Cancelados → mensaje de “no disponible” hasta que API soporte el campo
- [ ] Búsqueda por teléfono funciona junto con filtros

#### Cobranza

- [ ] Apertura de caja
- [ ] Cierre de caja
- [ ] Venta de paquete
- [ ] Pago con referencia inválida → mensaje al usuario
- [ ] Tab Producto → verificar comportamiento (hoy sin implementar)

#### Tickets

- [x] Crear ticket con técnico desde API (nombre visible, no solo ID)
- [ ] Actualizar estatus + reporte → verificar persistencia en backend (`actualizacion`)
- [x] Búsqueda por ID cliente, nombre, correo, teléfono
- [x] Filtros En Proceso / Finalizados / Todos
- [ ] Reasignar técnico → verificar persistencia en backend (hoy solo local)
- [ ] Rol Técnico: puede actualizar estatus
- [ ] Rol Cajero: no puede actualizar estatus (según permisos)

#### Usuarios y roles

- [ ] Crear usuario
- [ ] Editar usuario
- [ ] Eliminar usuario
- [ ] Verificar mismo backend en create/update/delete
- [ ] Editar permisos de rol de sistema (no eliminar)
- [ ] Crear / editar / eliminar rol personalizado
- [ ] Restablecer permisos de rol de sistema
- [ ] Asignar rol custom a un usuario y validar menú/acciones

---

## 4. Optimización

### 4.1 Performance (impacto alto)

- [x] **Clientes:** filtros y búsqueda en servidor + campos mínimos (`customersService`, sin `populate=*`)
- [x] **Clientes:** paginación server-side (`pagination[page]` / `pageSize` / `withCount`)
- [x] **TicketTracker:** carga solo clientes por IDs referenciados (`fetchCustomersByIds`), no todos los usuarios
- [ ] **ventaService:** reducir N requests en `obtenerTransaccionesDeVentas`
- [x] **Clientes:** re-fetch solo al cerrar modal de cliente (no en cada toggle)
- [ ] **Cobranza:** reemplazar MUI `Drawer` por Radix/shadcn `Sheet` (reducir bundle ~184 kB)
- [ ] **Layout:** evaluar Font Awesome Pro CDN → iconos locales o lucide-react
- [ ] Remover JSONs enormes del repo (`clientes.json`, `clientesDepurados.json`)

### 4.2 Código y arquitectura

- [x] `customersService` centralizado con `businessApi` + `handleApiError`
- [ ] Centralizar todas las llamadas API en `lib/api/config.ts` (falta `ticketService` y axios directo en páginas)
- [ ] Unificar manejo de errores con `handleApiError` en todos los servicios
- [ ] Implementar `RETRY_ATTEMPTS` / `RETRY_DELAY` (definidos pero no usados)
- [ ] Reducir duplicación entre `CustomerForm` y `CreateCustomer`
- [ ] Alinear `eslint-config-next` con Next.js 15 (`package.json`)
- [x] Eliminar `console.log` de `TicketTracker`
- [ ] Eliminar `console.log` de producción restantes (`RegisterPay`, `customers` si aplica)
- [ ] Considerar `React.memo` en `Table` y listas grandes
- [ ] Flags de feature documentados: `SIMULAR_REASIGNACION`, `ESTADO_SERVICIO_API_HABILITADO`, `ROLES_PERMISSIONS_API_HABILITADO`

---

## 5. Roadmap sugerido

### Fase 1 — Seguridad y estabilidad (1–2 sprints)

- [x] Mover y corregir middleware; unificar cookie/sessionStorage
- [ ] Login POST; quitar credenciales de URL (pendiente backend)
- [x] Eliminar selector de rol de `InfoClient`
- [x] Guards por ruta según permisos (roles sistema + custom)
- [x] Corregir layout anidado html/body
- [x] Unificar URLs de API en `lib/api/config.ts`

### Fase 2 — Completar features (2–3 sprints)

- [x] Completar actualización de tickets (`actualizacion` en payload)
- [x] Reasignación real de técnicos (`id_tecnico` en API)
- [ ] Activar API de roles/permisos (`ROLES_PERMISSIONS_API_HABILITADO`)
- [ ] Activar estatus Cancelado cuando backend esté listo (`ESTADO_SERVICIO_API_HABILITADO`)
- [x] Ocultar tab Producto en cobranza
- [x] Contenido / redirect útil en `/dashboard`
- [x] Feedback consistente (toasts) en formularios de cliente
- [x] Limpiar componentes legacy (`RegisterPay`, `UpdateCustomer`, stub login)

### Fase 3 — Calidad y rendimiento

- [ ] Tests E2E: login, permisos, caja, pago, tickets, roles
- [ ] Paginación server-side en clientes
- [ ] Remover JSONs con PII del repo
- [ ] Alinear dependencias (eslint-config-next 15)

---

## 6. Avances recientes (Ticket system improvements)

Resumen de lo ya implementado en ese chat, para no reabrir trabajo hecho:

| Área | Hecho | Pendiente relacionado |
|---|---|---|
| Búsqueda tickets | ID, cliente, nombre, correo, teléfono, descripción | — |
| Filtros tickets | En Proceso / Finalizados / Todos (misma fila) | — |
| Técnicos | Carga desde API, nombre visible | Unificar CMS vs BUSINESS API |
| Reasignación | UI + simulación `localStorage` | API real (`reasignado`, `id_tecnico`) |
| Clientes filtros | Activos / Inactivos / Cancelados / Todos | Activar Cancelado en API |
| Clientes carga | Filtro/búsqueda servidor, campos mínimos | Paginación server-side |
| TicketTracker clientes | Solo por IDs del ticket | — |
| Roles y permisos | UI CRUD + `localStorage` + integración `getUserPermissions` | API backend + guards de ruta |
| Feedback clientes | `fetchError` visible + reintentar | Toasts en create/edit |

---

## 7. Archivos clave para revisión

```
app/page.tsx                                          # Login
app/middleware.tsx                                    # Auth server (ubicación incorrecta)
components/ProtectedRoute.tsx                         # Auth client
lib/roles.ts                                          # RBAC + rolesPermissionsService
lib/utils/rolesPermissionsConfig.ts                   # Flags y mapeo de permisos
lib/services/rolesPermissionsService.ts               # Persistencia roles (localStorage)
components/molecules/RolesPermissions/                # UI Roles y permisos
lib/api/config.ts                                     # API central
lib/services/customersService.ts                      # Lista/filtros clientes optimizados
lib/utils/customerServiceStatus.ts                    # Estatus servicio + flag Cancelado
components/molecules/ServiceStatusBadge/              # Badge de estatus
app/dashboard/customers/page.tsx                      # Clientes
app/dashboard/cobranza/page.tsx                       # Cobranza
app/dashboard/reportes/page.tsx                       # Tickets
app/dashboard/usuarios/page.tsx                       # Usuarios + Roles
components/molecules/TicketTracker/TicketTracker.tsx  # Seguimiento / reasignación
components/molecules/InfoClient/                      # Header usuario / selector rol
lib/ticketService.ts                                  # Tickets (URL aún hardcodeada)
app/dashboard/clientes.json                           # Datos huérfanos
```

---

## Notas

- Marca cada ítem con `[x]` al completarlo.
- Prioridad sugerida: **Fase 1 → Fase 2 → Fase 3**.
- Flags de feature a vigilar al integrar backend:
  - `SIMULAR_REASIGNACION` en `TicketTracker.tsx`
  - `ESTADO_SERVICIO_API_HABILITADO` en `customerServiceStatus.ts`
  - `ROLES_PERMISSIONS_API_HABILITADO` en `rolesPermissionsConfig.ts`
- Este documento no reemplaza validación en backend; el frontend depende de que el API también valide roles y permisos.
)

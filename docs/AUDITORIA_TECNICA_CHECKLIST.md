# Auditoría técnica — Dashboard Regatelecom

> Checklist de seguimiento para deuda técnica, mejoras de flujo, manejo de escenarios y optimización.  
> Basado en la revisión del proyecto (lint/build OK, tests 0%).  
> **Última actualización:** Julio 2026 (incluye avances FE: clientes optimizados, modales lazy, eliminar cliente, APIs centralizadas)

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

- [x] **Cobranza → venta por Producto (oculto / sin API)**
  - [x] Tab **Producto** oculto en panel **Crear Venta** — solo se muestra **Paquete** como pestaña fija
  - [x] Al abrir venta se fuerza `TABS_VENTA.PAQUETE` (`openDrawerVenta`, navegación desde Clientes)
  - [x] Flujo **Paquete** operativo: buscar cliente por ID → facturas pendientes → carrito → pago
  - [ ] Botón **“Crear producto”** en pantalla principal de Cobranza — visible pero **sin implementar** (placeholder; opcional ocultar en FE)
  - [ ] Tab **Producto** en Crear Venta — reactivar cuando exista API de catálogo/búsqueda de productos
  - [ ] CRUD catálogo de productos (crear, listar, buscar) — requiere endpoints en CMS/BUSINESS
  - [ ] Agregar productos sueltos al carrito (distinto a facturas de paquete) — requiere API + UI
  - [ ] Constante `VALORES_DEFECTO.TAB_VENTA` sigue en `PRODUCTO` (`constants/cobranza.ts`); al reactivar tab, alinear default o forzar Paquete explícitamente

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
  - [x] Sin llamadas `axios` directas fuera de `lib/api/config.ts` (verificado)

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

- [ ] Revisar y remover `app/dashboard/clientes.json` (~47k líneas, no usado en runtime) — ignorado en git; archivos locales conservados
- [ ] Revisar y remover `app/dashboard/clientesDepurados.json` (~3.7k líneas, no usado en runtime) — ignorado en git
- [ ] Verificar que no contengan PII expuesta en el repo
- [x] Agregar a `.gitignore` si deben conservarse solo en local
- [x] Sacar del índice de git (`git rm --cached`) para que no se publiquen en el repo

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
- [x] **Cobranza — solo Paquete:** tab Producto oculto; venta por cliente + facturas pendientes
- [ ] **Cobranza — Producto:** catálogo, búsqueda y venta de productos sueltos (requiere API)
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
| TicketTracker update | ✅ Toast | ✅ Toast destructive | — |
| TicketTracker reasignación | ✅ Toast | ✅ Toast destructive | Campo `reasignado` en API |
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
- [x] Cambiar rol en header → selector de pruebas eliminado de `InfoClient`

#### Clientes

- [x] API caída → error visible con opción de reintentar
- [x] Crear cliente → toast de éxito/error
- [x] Editar cliente → toast de éxito/error
- [ ] Cobranza sin caja abierta → mensaje claro, sin navegación rota
- [ ] Filtro Activos / Inactivos / Todos → conteos coherentes con servidor
- [ ] Filtro Cancelados → mensaje de “no disponible” hasta que API soporte el campo
- [ ] Búsqueda por teléfono funciona junto con filtros

#### Cobranza

- [ ] Apertura de caja
- [ ] Cierre de caja
- [ ] Venta de paquete (flujo activo)
- [ ] Pago con referencia inválida → mensaje al usuario
- [x] Tab Producto → oculto en Crear Venta; solo Paquete hasta tener API
- [ ] Botón “Crear producto” en pantalla principal → placeholder sin acción (opcional ocultar en FE)

#### Tickets

- [x] Crear ticket con técnico desde API (nombre visible, no solo ID)
- [ ] Actualizar estatus + reporte → verificar persistencia en backend (`actualizacion`)
- [x] Búsqueda por ID cliente, nombre, correo, teléfono
- [x] Filtros En Proceso / Finalizados / Todos
- [ ] Reasignar técnico → verificar persistencia en backend (`id_tecnico` ya se envía; validar en Strapi)
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
  - [x] **Clientes:** fallback con caché en cliente si la API ignora paginación (`usedClientPagination` + `listCacheRef`)
  - [x] **Clientes:** modales lazy-mount (`clientModalMounted`) + delay de desmontaje Radix (`DIALOG_UNMOUNT_DELAY_MS`) — evita error `removeChild`
  - [x] **Clientes:** layout desktop — botón Nuevo + buscador + filtros en una fila (`customers.module.css`)
  - [x] **Clientes:** `React.memo` en `Table`
  - [x] **TicketTracker:** carga solo clientes por IDs referenciados (`fetchCustomersByIds`), no todos los usuarios
  - [x] **API dev logging:** `responseLogger` resume arrays (conteo/meta) en lugar de volcar todo el payload
  - [x] **ventaService:** reducir N requests en `obtenerTransaccionesDeVentas` — batch con `filters[idTransaccion][$in]` (chunks de 50)
  - [x] **Clientes:** re-fetch solo al cerrar modal de cliente (no en cada toggle)
  - [x] **Cobranza:** reemplazar MUI `Drawer` por Radix/shadcn `Sheet` — `@mui/material` y `@emotion/*` eliminados del proyecto
  - [ ] **Layout:** evaluar Font Awesome Pro CDN → iconos locales o `lucide-react` (login, navbar, cobranza, usuarios, clientes)
- [ ] Remover JSONs enormes del repo (`clientes.json`, `clientesDepurados.json`) — ignorados en git; pendiente borrar del historial remoto en próximo push

### 4.2 Código y arquitectura

- [x] `customersService` centralizado con `businessApi` + `handleApiError`
- [x] Centralizar llamadas API en `lib/api/config.ts` (`businessApi`, `cmsApi`; sin axios directo en páginas)
- [x] Unificar manejo de errores con `handleApiError` en servicios y hooks principales
- [ ] Implementar `RETRY_ATTEMPTS` / `RETRY_DELAY` en interceptor axios (definidos en `API_CONFIG`, no usados)
- [x] Reducir duplicación entre `CustomerForm` y `CreateCustomer` — `CreateCustomer` es wrapper ligero
- [ ] Alinear `eslint-config-next` con Next.js 15 (`package.json` tiene Next 15.2.4 vs eslint-config-next 14.2.13)
- [x] Eliminar `console.log` de `TicketTracker`
- [x] Eliminar `console.*` residuales en todo el proyecto (interceptores API, hooks, páginas, componentes)
- [x] `React.memo` en `Table` de clientes
- [ ] Considerar `React.memo` en listas de usuarios y tickets
- [ ] Flags de feature documentados: `ESTADO_SERVICIO_API_HABILITADO`, `ROLES_PERMISSIONS_API_HABILITADO`

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
- [x] Ocultar tab Producto en cobranza (detalle en §1.2 Cobranza → venta por Producto)
- [ ] Reactivar tab Producto + catálogo cuando API esté lista
- [x] Contenido / redirect útil en `/dashboard`
- [x] Feedback consistente (toasts) en formularios de cliente
- [x] Limpiar componentes legacy (`RegisterPay`, `UpdateCustomer`, stub login)

### Fase 3 — Calidad y rendimiento

- [ ] Tests E2E: login, permisos, caja, pago, tickets, roles
- [x] Paginación server-side en clientes (+ fallback caché cliente)
- [ ] Remover JSONs con PII del repo
- [ ] Alinear dependencias (eslint-config-next 15)
- [x] Reemplazar MUI Drawer por shadcn Sheet en cobranza
- [x] Refactor `CreateCustomer` → wrapper de `CustomerForm`

---

## 6. Avances recientes (Ticket system improvements)

Resumen de lo ya implementado en ese chat, para no reabrir trabajo hecho:

| Área | Hecho | Pendiente relacionado |
|---|---|---|
| Búsqueda tickets | ID, cliente, nombre, correo, teléfono, descripción | — |
| Filtros tickets | En Proceso / Finalizados / Todos (misma fila) | — |
| Técnicos | Carga desde API, nombre visible | Unificar CMS vs BUSINESS API |
| Reasignación | UI + `id_tecnico` en API + toast | Campo `reasignado` en backend |
| Clientes filtros | Activos / Inactivos / Cancelados / Todos | Activar Cancelado en API |
| Clientes carga | Filtro/búsqueda servidor, paginación, caché, modales lazy | — |
| TicketTracker clientes | Solo por IDs del ticket | — |
| Roles y permisos | UI CRUD + `localStorage` + guards de ruta | API backend |
| Feedback clientes | `fetchError` + toasts create/edit + eliminar con confirmación | — |

---

## 7. Archivos clave para revisión

```
middleware.ts                                         # Auth server (raíz)
lib/auth/session.ts                                   # Cookie + sessionStorage
app/page.tsx                                          # Login
components/ProtectedRoute.tsx                         # Auth client + permisos por ruta
lib/roles.ts                                          # RBAC + rolesPermissionsService
lib/utils/rolesPermissionsConfig.ts                   # Flags y mapeo de permisos
lib/services/rolesPermissionsService.ts               # Persistencia roles (localStorage)
components/molecules/RolesPermissions/                # UI Roles y permisos
lib/api/config.ts                                     # API central (businessApi, cmsApi)
lib/services/customersService.ts                      # Lista/filtros/paginación clientes
lib/utils/customerServiceStatus.ts                    # Estatus servicio + flag Cancelado
components/molecules/ServiceStatusBadge/              # Badge de estatus
components/molecules/ConfirmActionModal/              # Modal confirmación reutilizable
app/dashboard/customers/page.tsx                    # Clientes (paginación, lazy modals)
app/dashboard/cobranza/page.tsx                       # Cobranza (Sheet; tab Paquete activo, Producto oculto)
app/dashboard/reportes/page.tsx                       # Tickets
app/dashboard/usuarios/page.tsx                       # Usuarios + Roles
components/molecules/TicketTracker/TicketTracker.tsx  # Seguimiento / reasignación
components/molecules/InfoClient/                      # Header usuario / logout
lib/ticketService.ts                                  # Tickets vía businessApi
lib/services/ventaService.ts                          # Transacciones en batch ($in)
app/dashboard/clientes.json                           # Datos huérfanos (eliminar)
app/dashboard/clientesDepurados.json                  # Datos huérfanos (eliminar)
```

---

## 8. Próximo sprint — solo Frontend (sin depender de backend)

### Completado en sprint actual

| # | Tarea | Estado |
|---|---|---|
| 1 | JSONs PII en `.gitignore` + `git rm --cached` | [x] |
| 2 | Cobranza: MUI Drawer → shadcn Sheet | [x] |
| 3 | `CreateCustomer` → wrapper de `CustomerForm` | [x] |

### Pendiente — orden sugerido

| # | Tarea | Impacto | Esfuerzo | Notas |
|---|---|---|---|---|
| 4 | `ventaService`: batch de transacciones (1 request con `$in`) | Performance cobranza | Medio | [x] `obtenerTransaccionesPorIds` con chunks de 50 |
| 5 | Retry en interceptor axios (`RETRY_ATTEMPTS`) | Resiliencia red | Bajo | Ya definido en `API_CONFIG` |
| 6 | Alinear `eslint-config-next` a v15 | Mantenimiento | Bajo | Next 15.2.4 vs eslint-config-next 14.2.13 |
| 7 | Limpiar `console.*` en todo el proyecto | Limpieza | Bajo | [x] Sin `console` en código fuente TS/TSX |
| 8 | Font Awesome CDN → `lucide-react` | Carga inicial | Medio-Alto | login, navbar, cobranza, usuarios, clientes |
| 9 | Ocultar botón “Crear producto” (placeholder Cobranza) | UX / claridad | Bajo | Evita confusión hasta tener API de productos |
| 10 | Setup tests E2E (Playwright) | Calidad | Alto | login, permisos, caja, pago paquete, tickets |
| 11 | `React.memo` en tablas de usuarios/tickets | Re-renders | Bajo | Opcional tras medir |
| 12 | Commit/push para quitar JSONs del remoto | Seguridad | Bajo | Tras `git rm --cached`, falta commit |

**Bloqueados por backend** (no avanzar solo en FE): login POST/httpOnly, `ROLES_PERMISSIONS_API_HABILITADO`, `ESTADO_SERVICIO_API_HABILITADO`, campo `reasignado` en tickets, **catálogo y venta por Producto en Cobranza**.

---

## Notas

- Marca cada ítem con `[x]` al completarlo.
- Prioridad sugerida: **Fase 1 → Fase 2 → Fase 3**.
- Flags de feature a vigilar al integrar backend:
  - `ESTADO_SERVICIO_API_HABILITADO` en `customerServiceStatus.ts`
  - `ROLES_PERMISSIONS_API_HABILITADO` en `rolesPermissionsConfig.ts`
- Dependencias pesadas: Font Awesome Pro CDN (candidato a `lucide-react`); MUI ya removido
- Este documento no reemplaza validación en backend; el frontend depende de que el API también valide roles y permisos.
)

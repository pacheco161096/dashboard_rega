# Auditoría técnica — Dashboard Regatelecom

> Checklist de seguimiento para deuda técnica, mejoras de flujo, manejo de escenarios y optimización.  
> Basado en la revisión del proyecto (lint/build OK, tests 0%).  
> **Última actualización:** Julio 2026 (incluye avances del chat [Ticket system improvements])

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

- [ ] **Autenticación server-side**
  - [ ] Mover `app/middleware.tsx` → `middleware.ts` en la raíz del proyecto (Next.js no ejecuta middleware dentro de `app/`)
  - [ ] Unificar sesión: login escribe `sessionStorage` pero middleware busca cookie `loginUser`
  - [ ] Proteger todas las rutas `/dashboard/*` en middleware

- [ ] **Login seguro**
  - [ ] Cambiar login de GET con credenciales en query string a POST con body (`app/page.tsx`)
  - [ ] Eliminar exposición de usuario/contraseña en URL, logs e historial

- [ ] **RBAC real (control de acceso por roles)**
  - [x] UI de roles y permisos personalizados en `/dashboard/usuarios` (pestaña "Roles y permisos")
  - [x] Roles de sistema editables pero no eliminables; roles custom con CRUD completo
  - [x] Matriz de permisos por módulo (ver, crear, editar, eliminar) integrada con `getUserPermissions()`
  - [ ] Persistencia solo en `localStorage` — activar API (`ROLES_PERMISSIONS_API_HABILITADO = false`)
  - [ ] Agregar guard por página según permisos (no solo ocultar links en Navbar)
  - [ ] Bloquear acceso directo por URL a rutas sin permiso (ej. `/dashboard/usuarios`, `/dashboard/cobranza`)
  - [ ] Roles personalizados: validar que el backend acepte IDs no numéricos al asignar usuarios

- [ ] **Eliminar selector de rol en producción**
  - [ ] Quitar selector de rol de pruebas en `components/molecules/InfoClient/InfoClient.tsx`
  - [ ] Eliminar fallback automático a Admin cuando el usuario no tiene rol

---

### 1.2 Features a medias

- [ ] **Dashboard principal** (`/dashboard`)
  - [ ] Implementar contenido real (KPIs, resumen) o redirigir a módulo útil para Admin

- [ ] **Login duplicado** (`/dashboard/login`)
  - [ ] Eliminar stub o redirigir a `/` (login real está en raíz)

- [ ] **Cobranza → tab Producto**
  - [ ] Conectar inputs "Buscar Producto" con lógica y API
  - [ ] O bien ocultar el tab hasta que esté implementado

- [ ] **TicketTracker — actualizar ticket**
  - [ ] Enviar campo `actualizacion` en el payload al actualizar (`TicketTracker.tsx` — `updateDescription` se valida en UI pero **no se envía**)
  - [ ] Persistir reporte del técnico (`updateDescription`) en backend
  - [ ] Completar lógica de historial de actualizaciones existentes

- [x] **TicketTracker — búsqueda y filtros**
  - [x] Búsqueda ampliada: ID ticket, ID cliente, nombre, correo, teléfono, descripción
  - [x] Filtros de ticket en la misma fila del buscador: En Proceso, Finalizados, Todos

- [x] **TicketTracker — técnicos desde API**
  - [x] Cargar técnicos con `UsuariosService.obtenerTecnicos()` (misma fuente que TicketForm)
  - [x] Mostrar nombre del técnico en lugar del ID

- [ ] **TicketTracker — reasignación de técnicos**
  - [x] UI de reasignación (select, botón dinámico Reasignar / Cancelar / Guardar con iconos)
  - [x] Bandera visual "Reasignado"
  - [ ] Hoy es **simulación local** (`SIMULAR_REASIGNACION = true` + `localStorage`) — no llama API
  - [ ] Persistir `id_tecnico` y campo `reasignado` en backend cuando la API lo soporte
  - [ ] Quitar overrides de `localStorage` al activar API real

- [ ] **Clientes — estatus de servicio**
  - [x] Filtros Activos / Inactivos / Cancelados / Todos en la misma fila del buscador
  - [x] Búsqueda por ID, nombre, correo o teléfono
  - [x] Badge reutilizable `ServiceStatusBadge`
  - [x] Preparación para estatus **Cancelado** (`estado_servicio` enum futuro)
  - [ ] Activar `ESTADO_SERVICIO_API_HABILITADO = true` cuando el backend exponga el campo
  - [ ] Verificar filtro Cancelados con datos reales de API

- [ ] **RegisterPay** (`components/molecules/RegisterPay/RegisterPay.tsx`)
  - [ ] Integrar con API de pago o eliminar componente legacy (hoy solo hace `console.log`)

- [ ] **UpdateCustomer** (`components/molecules/updateCustomer/UpdateCustomer.tsx`)
  - [ ] Implementar submit y persistencia o eliminar si no se usará

- [ ] **Módulo Almacén**
  - [ ] Crear ruta `/dashboard/almacen` o quitar referencia en `SectionTitle.tsx`

- [ ] **Eliminar cliente**
  - [ ] Implementar acción usando permiso `canDeleteClient` (definido y mapeado en roles, pero no usado en UI)

---

### 1.3 Inconsistencias de backend / APIs

- [ ] **Centralizar URLs de API**
  - [x] `customersService` usa `businessApi` de `lib/api/config.ts`
  - [ ] Usar `lib/api/config.ts` en todos los módulos (evitar URLs hardcodeadas repetidas)
  - [ ] Migrar `lib/ticketService.ts` a la instancia central de API (sigue con URL hardcodeada)

- [ ] **Unificar backend de usuarios/técnicos**
  - [ ] Login / Usuarios / Clientes → `monkfish-app` (BUSINESS API)
  - [ ] TicketForm y TicketTracker (técnicos) → `cms.regatelecom.mx` (CMS API vía `UsuariosService`)
  - [ ] Definir una sola fuente de verdad para usuarios y técnicos

- [ ] **Alinear operaciones CRUD de usuarios**
  - [ ] GET/POST/DELETE y UPDATE deben usar el mismo backend y manejo de errores (`app/dashboard/usuarios/page.tsx`)

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

- [ ] Implementar flujo: Login POST → token/cookie httpOnly (o cookie + sessionStorage sincronizados)
- [ ] `middleware.ts` en raíz validando sesión en todas las rutas `/dashboard/*`
- [ ] Guard por página según `ROLE_PERMISSIONS` / roles custom con redirect si no tiene permiso
- [ ] Logout limpiando todo el estado: `loginUser`, `caja`, `selectedUser`, roles en memoria, etc.
- [ ] Eliminar fallback `roleId || "1"` (Admin por defecto) en login

### 2.2 Flujos de negocio

- [ ] **Cliente → Cobranza:** si no hay caja abierta, no navegar sin `selectedUser`; mostrar toast claro
- [ ] **Crear cliente:** dejar de usar password fijo `"123456789"` y rol `"2"` hardcodeado
- [x] **Crear / seguir ticket:** una sola fuente de técnicos en UI (`UsuariosService.obtenerTecnicos()`)
- [ ] **Actualizar ticket:** flujo completo estatus + reporte técnico persistido (`actualizacion` en payload)
- [ ] **Reasignar técnico:** dejar de simular en `localStorage` y persistir en API
- [ ] **Admin post-login:** no dejar al usuario en `/dashboard` vacío
- [x] **Clientes:** filtros de estatus + búsqueda en servidor (debounce 400 ms)
- [ ] **Clientes Cancelado:** activar cuando API soporte `estado_servicio`

### 2.3 Layout y estructura

- [ ] Corregir `app/dashboard/layout.tsx` — quitar `<html>` y `<body>` anidados (ya existen en `app/layout.tsx`)
- [ ] Evitar HTML inválido y posibles bugs de hidratación

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
| CustomerForm / CreateCustomer | Cierra modal | ❌ Solo `console.error` | Toast éxito/error |
| Tickets crear | Redirige | Banner inline | — |
| Tickets stats | Muestra 0 | Estado interno | Avisar si hubo error |
| TicketTracker update | Banner verde | Inline | Éxito engañoso si no guarda reporte (`actualizacion`) |
| TicketTracker reasignación | Banner local | Inline | Simulación: no falla por API pero no persiste en servidor |
| useVentas | — | console | `useToast` importado, no usado |
| useTicketForm / useTicketStats | — | String inline | Sin toast |

### 3.2 Tareas de mejora de feedback

- [x] **Clientes:** mostrar mensaje visible cuando falla el fetch (no solo lista vacía)
- [ ] **CustomerForm / CreateCustomer:** toast de éxito y error
- [ ] **Cobranza:** avisar al usuario cuando referencia de pago es inválida (no return silencioso)
- [ ] **useVentas:** usar toast o quitar import muerto de `useToast`
- [ ] **useTicketForm / useTicketStats:** alinear con patrón de toast de cobranza
- [ ] **Tickets stats:** indicar al usuario si hubo error al cargar estadísticas
- [ ] **TicketTracker update:** no mostrar éxito si el reporte del técnico no se persistió
- [ ] Unificar patrón de feedback en todo el proyecto (preferir toast Radix)

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
- [ ] **Clientes:** paginación server-side (hoy se carga el listado filtrado completo y se pagina en cliente)
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

- [ ] Mover y corregir middleware; unificar cookie/sessionStorage
- [ ] Login POST; quitar credenciales de URL
- [ ] Eliminar selector de rol de `InfoClient`
- [ ] Guards por ruta según permisos (roles sistema + custom)
- [ ] Corregir layout anidado html/body
- [ ] Unificar URLs de API en `lib/api/config.ts`

### Fase 2 — Completar features (2–3 sprints)

- [ ] Completar actualización de tickets (`actualizacion` en payload)
- [ ] Reasignación real de técnicos (quitar simulación `localStorage`)
- [ ] Activar API de roles/permisos (`ROLES_PERMISSIONS_API_HABILITADO`)
- [ ] Activar estatus Cancelado cuando backend esté listo (`ESTADO_SERVICIO_API_HABILITADO`)
- [ ] Implementar u ocultar tab Producto en cobranza
- [ ] Contenido real en `/dashboard` o redirección útil
- [ ] Feedback consistente (toasts) en formularios de cliente
- [ ] Limpiar componentes legacy (`RegisterPay`, `UpdateCustomer`, stub login)

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

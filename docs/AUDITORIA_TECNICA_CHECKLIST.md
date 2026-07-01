# Auditoría técnica — Dashboard Regatelecom

> Checklist de seguimiento para deuda técnica, mejoras de flujo, manejo de escenarios y optimización.  
> Basado en la revisión del proyecto (lint/build OK, tests 0%).  
> **Última actualización:** Julio 2026

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
  - [ ] Agregar guard por página según `ROLE_PERMISSIONS` (no solo ocultar links en Navbar)
  - [ ] Bloquear acceso directo por URL a rutas sin permiso (ej. `/dashboard/usuarios`, `/dashboard/cobranza`)

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
  - [ ] Enviar campo `actualizacion` en el payload al actualizar (`components/molecules/TicketTracker/TicketTracker.tsx`)
  - [ ] Persistir reporte del técnico (`updateDescription`) en backend
  - [ ] Descomentar/completar lógica de actualizaciones existentes

- [ ] **RegisterPay** (`components/molecules/RegisterPay/RegisterPay.tsx`)
  - [ ] Integrar con API de pago o eliminar componente legacy (hoy solo hace `console.log`)

- [ ] **UpdateCustomer** (`components/molecules/updateCustomer/UpdateCustomer.tsx`)
  - [ ] Implementar submit y persistencia o eliminar si no se usará

- [ ] **Módulo Almacén**
  - [ ] Crear ruta `/dashboard/almacen` o quitar referencia en `SectionTitle.tsx`

- [ ] **Eliminar cliente**
  - [ ] Implementar acción usando permiso `canDeleteClient` (definido en `lib/roles.ts` pero no usado)

---

### 1.3 Inconsistencias de backend / APIs

- [ ] **Centralizar URLs de API**
  - [ ] Usar `lib/api/config.ts` en todos los módulos (evitar URLs hardcodeadas repetidas)
  - [ ] Migrar `lib/ticketService.ts` a la instancia central de API

- [ ] **Unificar backend de usuarios/técnicos**
  - [ ] Login / Usuarios / Clientes → `monkfish-app` (BUSINESS API)
  - [ ] TicketForm (técnicos) → `cms.regatelecom.mx` (CMS API)
  - [ ] Definir una sola fuente de verdad para usuarios y técnicos

- [ ] **Alinear operaciones CRUD de usuarios**
  - [ ] GET/POST/DELETE y UPDATE deben usar el mismo backend y manejo de errores (`app/dashboard/usuarios/page.tsx`)

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
- [ ] Tests de permisos por rol (RBAC)

---

## 2. Mejoras de flujo

### 2.1 Autenticación y sesión

- [ ] Implementar flujo: Login POST → token/cookie httpOnly (o cookie + sessionStorage sincronizados)
- [ ] `middleware.ts` en raíz validando sesión en todas las rutas `/dashboard/*`
- [ ] Guard por página según `ROLE_PERMISSIONS` con redirect si no tiene permiso
- [ ] Logout limpiando todo el estado: `loginUser`, `caja`, `selectedUser`, etc.
- [ ] Eliminar fallback `roleId || "1"` (Admin por defecto) en login

### 2.2 Flujos de negocio

- [ ] **Cliente → Cobranza:** si no hay caja abierta, no navegar sin `selectedUser`; mostrar toast claro
- [ ] **Crear cliente:** dejar de usar password fijo `"123456789"` y rol `"2"` hardcodeado
- [ ] **Crear ticket:** una sola fuente de técnicos (API), eliminar lista hardcodeada `TECNICOS` en TicketTracker
- [ ] **Actualizar ticket:** flujo completo estatus + reporte técnico persistido
- [ ] **Admin post-login:** no dejar al usuario en `/dashboard` vacío

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
| Clientes (fetch) | Lista cargada | ❌ Solo `console.log` | Mostrar error al usuario |
| CustomerForm / CreateCustomer | Cierra modal | ❌ Solo `console.error` | Toast éxito/error |
| Tickets crear | Redirige | Banner inline | — |
| Tickets stats | Muestra 0 | Estado interno | Avisar si hubo error |
| TicketTracker update | Banner verde | Inline | Éxito engañoso si no guarda reporte |
| useVentas | — | console | `useToast` importado, no usado |
| useTicketForm / useTicketStats | — | String inline | Sin toast |

### 3.2 Tareas de mejora de feedback

- [ ] **Clientes:** mostrar mensaje visible cuando falla el fetch (no solo lista vacía)
- [ ] **CustomerForm / CreateCustomer:** toast de éxito y error
- [ ] **Cobranza:** avisar al usuario cuando referencia de pago es inválida (no return silencioso)
- [ ] **useVentas:** usar toast o quitar import muerto de `useToast`
- [ ] **useTicketForm / useTicketStats:** alinear con patrón de toast de cobranza
- [ ] **Tickets stats:** indicar al usuario si hubo error al cargar estadísticas
- [ ] Unificar patrón de feedback en todo el proyecto (preferir toast Radix)

---

### 3.3 Escenarios de prueba manual / E2E

#### Autenticación

- [ ] Login credenciales incorrectas → mensaje claro
- [ ] Acceso directo a `/dashboard/usuarios` sin sesión → redirect a `/`
- [ ] Acceso con rol Cajero a `/dashboard/usuarios` → debe bloquearse
- [ ] Logout → no debe quedar estado residual en sessionStorage
- [ ] Cambiar rol en header → actualmente permite escalación (corregir)

#### Clientes

- [ ] API caída → error visible, no lista vacía silenciosa
- [ ] Crear cliente → feedback de éxito/error
- [ ] Editar cliente → feedback de éxito/error
- [ ] Cobranza sin caja abierta → mensaje claro, sin navegación rota

#### Cobranza

- [ ] Apertura de caja
- [ ] Cierre de caja
- [ ] Venta de paquete
- [ ] Pago con referencia inválida → mensaje al usuario
- [ ] Tab Producto → verificar comportamiento (hoy sin implementar)

#### Tickets

- [ ] Crear ticket con técnico desde API
- [ ] Actualizar estatus + reporte → verificar persistencia en backend
- [ ] Rol Técnico: puede actualizar estatus
- [ ] Rol Cajero: no puede actualizar estatus (según permisos)

#### Usuarios

- [ ] Crear usuario
- [ ] Editar usuario
- [ ] Eliminar usuario
- [ ] Verificar mismo backend en create/update/delete

---

## 4. Optimización

### 4.1 Performance (impacto alto)

- [ ] **Clientes:** paginación server-side en lugar de cargar todos con `populate=*`
- [ ] **TicketTracker:** evitar descarga masiva de todos los clientes 2× por operación
- [ ] **ventaService:** reducir N requests en `obtenerTransaccionesDeVentas`
- [ ] **Clientes:** evitar re-fetch al abrir/cerrar modal innecesariamente
- [ ] **Cobranza:** reemplazar MUI `Drawer` por Radix/shadcn `Sheet` (reducir bundle ~184 kB)
- [ ] **Layout:** evaluar Font Awesome Pro CDN → iconos locales o lucide-react
- [ ] Remover JSONs enormes del repo (`clientes.json`, `clientesDepurados.json`)

### 4.2 Código y arquitectura

- [ ] Centralizar todas las llamadas API en `lib/api/config.ts`
- [ ] Unificar manejo de errores con `handleApiError` en todos los servicios
- [ ] Implementar `RETRY_ATTEMPTS` / `RETRY_DELAY` (definidos pero no usados)
- [ ] Reducir duplicación entre `CustomerForm` y `CreateCustomer`
- [ ] Alinear `eslint-config-next` con Next.js 15 (`package.json`)
- [ ] Eliminar `console.log` de producción (`RegisterPay`, `TicketTracker`, `customers`)
- [ ] Considerar `React.memo` en `Table` y listas grandes

---

## 5. Roadmap sugerido

### Fase 1 — Seguridad y estabilidad (1–2 sprints)

- [ ] Mover y corregir middleware; unificar cookie/sessionStorage
- [ ] Login POST; quitar credenciales de URL
- [ ] Eliminar selector de rol de `InfoClient`
- [ ] Guards por ruta según `ROLE_PERMISSIONS`
- [ ] Corregir layout anidado html/body
- [ ] Unificar URLs de API en `lib/api/config.ts`

### Fase 2 — Completar features (2–3 sprints)

- [ ] Completar actualización de tickets (`actualizacion` en payload)
- [ ] Implementar u ocultar tab Producto en cobranza
- [ ] Contenido real en `/dashboard` o redirección útil
- [ ] Feedback consistente (toasts) en clientes y formularios
- [ ] Limpiar componentes legacy (`RegisterPay`, `UpdateCustomer`, stub login)

### Fase 3 — Calidad y rendimiento

- [ ] Tests E2E: login, permisos, caja, pago, tickets
- [ ] Paginación server-side y reducción de fetches
- [ ] Remover JSONs con PII del repo
- [ ] Alinear dependencias (eslint-config-next 15)

---

## 6. Archivos clave para revisión

```
app/page.tsx                              # Login
app/middleware.tsx                        # Auth server (ubicación incorrecta)
components/ProtectedRoute.tsx             # Auth client
lib/roles.ts                              # RBAC
lib/api/config.ts                         # API central
app/dashboard/customers/page.tsx        # Clientes
app/dashboard/cobranza/page.tsx           # Cobranza
app/dashboard/reportes/page.tsx           # Tickets
app/dashboard/usuarios/page.tsx           # Usuarios
components/molecules/TicketTracker/         # Seguimiento tickets
components/molecules/InfoClient/          # Header usuario / selector rol
app/dashboard/clientes.json               # Datos huérfanos
```

---

## Notas

- Marca cada ítem con `[x]` al completarlo.
- Prioridad sugerida: **Fase 1 → Fase 2 → Fase 3**.
- Este documento no reemplaza validación en backend; el frontend depende de que el API también valide roles y permisos.

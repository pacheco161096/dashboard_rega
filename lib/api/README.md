# Configuración de API

Este módulo centraliza toda la configuración de las APIs del sistema, incluyendo URLs base, timeouts, headers y manejo de errores.

## Uso Básico

### Importar las instancias de API

```typescript
import { cmsApi, businessApi } from "@/lib/api/config";

// Para APIs del CMS (Strapi)
const response = await cmsApi.get("/gastos");

// Para APIs de negocio
const response = await businessApi.post("/payment", data);
```

### Manejo de Errores

```typescript
import { cmsApi, handleApiError } from "@/lib/api/config";

try {
  const response = await cmsApi.get("/gastos");
} catch (error) {
  const customError = handleApiError(error);
  console.error(customError.message);
  // customError.statusCode contiene el código de estado HTTP
}
```

## Instancias Disponibles

### `cmsApi`

Instancia de axios configurada para la API del CMS (Strapi).

- **URL Base**: `https://cms.regatelecom.mx/api`
- **Uso**: Gastos, ventas, transacciones, cajas, etc.

### `businessApi`

Instancia de axios configurada para la API de negocio.

- **URL Base**: `https://monkfish-app-2et8k.ondigitalocean.app/api`
- **Uso**: Pagos, búsqueda de usuarios, tickets, etc.

## Utilidades

### `buildStrapiFilters`

Construye queries de filtros para Strapi:

```typescript
import { buildStrapiFilters } from "@/lib/api/config";

const filters = {
  idusuario: "123",
  activo: true,
};
const queryString = buildStrapiFilters(filters);
// Resultado: "filters[idusuario]=123&filters[activo]=true"
```

### `buildDateRangeFilter`

Construye filtros de rango de fechas para Strapi:

```typescript
import { buildDateRangeFilter } from "@/lib/api/config";

const dateFilter = buildDateRangeFilter(
  "createdAt",
  "2024-01-01",
  "2024-01-31"
);
// Resultado: "filters[createdAt][$gte]=2024-01-01T00:00:00.000Z&filters[createdAt][$lte]=2024-01-31T23:59:59.999Z"
```

### `getTodayISO`

Obtiene la fecha actual en formato ISO (solo fecha):

```typescript
import { getTodayISO } from "@/lib/api/config";

const today = getTodayISO();
// Resultado: "2024-01-15"
```

### `formatDateForStrapi`

Formatea una fecha para queries de Strapi:

```typescript
import { formatDateForStrapi } from "@/lib/api/config";

const isoDate = formatDateForStrapi(new Date());
// Resultado: "2024-01-15T10:30:00.000Z"
```

## Configuración

### Variables de Entorno (Opcionales)

Puedes sobrescribir las URLs base usando variables de entorno:

```env
NEXT_PUBLIC_CMS_API_URL=https://cms.regatelecom.mx/api
NEXT_PUBLIC_BUSINESS_API_URL=https://monkfish-app-2et8k.ondigitalocean.app/api
```

### Timeout

El timeout por defecto es de 30 segundos. Puedes crear una instancia personalizada:

```typescript
import { createApiInstance, API_URLS } from "@/lib/api/config";

const customApi = createApiInstance(API_URLS.CMS, 60000); // 60 segundos
```

## Características

- ✅ Manejo centralizado de errores
- ✅ Logging automático en desarrollo
- ✅ Headers por defecto configurados
- ✅ Soporte para autenticación (preparado para tokens)
- ✅ Timeout configurable
- ✅ Tipos TypeScript completos

## Ejemplo Completo

```typescript
import {
  cmsApi,
  handleApiError,
  getTodayISO,
  buildDateRangeFilter,
} from "@/lib/api/config";

async function obtenerGastosDelDia() {
  try {
    const today = getTodayISO();
    const dateFilter = buildDateRangeFilter("createdAt", today, today);

    const response = await cmsApi.get(`/gastos?${dateFilter}`);
    return response.data;
  } catch (error) {
    const customError = handleApiError(error);
    throw customError;
  }
}
```

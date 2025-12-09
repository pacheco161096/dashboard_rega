# Implementación de la API de Tickets

## Descripción

Esta implementación permite crear y dar seguimiento a tickets de soporte técnico utilizando la API externa `https://monkfish-app-2et8k.ondigitalocean.app/api/tickets`.

## Estructura de Archivos

```
├── types/ticket.ts              # Tipos TypeScript para tickets
├── lib/ticketService.ts         # Servicio para manejar operaciones de tickets
├── hooks/useTicketForm.ts       # Hook personalizado para el formulario
├── hooks/useTicketStats.ts      # Hook para estadísticas de tickets
├── components/molecules/TicketForm/TicketForm.tsx      # Componente del formulario
├── components/molecules/TicketTracker/TicketTracker.tsx # Componente de seguimiento
└── app/dashboard/reportes/page.tsx                     # Página principal con dashboard
```

## Características Implementadas

### ✅ Funcionalidades Completadas

1. **Dashboard Principal**
   - Vista general del sistema de tickets
   - Estadísticas en tiempo real
   - Navegación entre funcionalidades
   - Diseño responsivo y moderno

2. **Formulario de Creación de Tickets**
   - Campos: fecha, ID cliente, estatus, ID técnico, descripción
   - Validación de campos requeridos
   - Interfaz de usuario moderna y responsiva
   - Estados de carga y manejo de errores

3. **Sistema de Seguimiento de Tickets**
   - Lista de todos los tickets
   - Búsqueda por ID, cliente o descripción
   - Filtrado en tiempo real
   - Vista detallada de cada ticket
   - Estadísticas de tickets (total, en proceso, finalizados)

4. **Integración con API**
   - Llamadas POST para crear tickets
   - Llamadas GET para obtener tickets
   - Manejo de errores robusto
   - Timeout de 10 segundos
   - Headers apropiados

5. **Estados de UI**
   - Indicadores de carga durante operaciones
   - Mensajes de éxito y error
   - Deshabilitación de formularios durante carga
   - Prevención de envíos múltiples

6. **Tipado TypeScript**
   - Interfaces completas para todos los tipos
   - Validación de tipos en tiempo de compilación
   - Autocompletado en el IDE

7. **Arquitectura Limpia**
   - Separación de responsabilidades
   - Servicio singleton para operaciones de API
   - Hooks personalizados para lógica de estado
   - Componentes reutilizables

## Estructura de Datos

### Datos del Formulario
```typescript
interface TicketFormData {
  fecha: string;
  id_cliente: string;
  estatus: string;
  id_tecnico: string;
  descripcion: string;
}
```

### Datos Enviados a la API
```typescript
interface TicketRequest {
  data: {
    fecha: string;
    id_cliente: number;
    estatus: string;
    id_tecnico: number;
    actualizacion: [
      {
        fecha: string;
        descripcion: string;
      }
    ];
  };
}
```

### Respuesta de la API (Lista de Tickets)
```typescript
interface TicketListResponse {
  data: TicketItem[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
```

## Uso

### Dashboard Principal

1. **Navegar** a `/dashboard/reportes`
2. **Ver** estadísticas en tiempo real:
   - Total de tickets
   - Tickets en proceso
   - Tickets finalizados
3. **Seleccionar** acción:
   - "Crear Ticket" para crear uno nuevo
   - "Ver Tickets" para consultar existentes

### Crear un Nuevo Ticket

1. **Hacer clic** en "Crear Ticket" en el dashboard
2. **Completar** el formulario con:
   - **Fecha**: Fecha del ticket
   - **ID Cliente**: Número de identificación del cliente
   - **Estatus**: "En proceso" o "Finalizado"
   - **ID Técnico**: Número de identificación del técnico
   - **Descripción**: Detalles del problema o solicitud
3. **Hacer clic** en "Crear Ticket"
4. **Ver** confirmación de éxito o error

### Seguimiento de Tickets

1. **Hacer clic** en "Ver Tickets" en el dashboard
2. **Usar** la barra de búsqueda para filtrar tickets
3. **Ver** estadísticas rápidas en la parte superior
4. **Hacer clic** en "Ver Detalles" para información completa
5. **Navegar** entre tickets usando el modal de detalles

### Búsqueda y Filtrado

- **Búsqueda por ID**: `TK-001`, `TK-002`, etc.
- **Búsqueda por Cliente**: ID del cliente
- **Búsqueda por Descripción**: Palabras clave en la descripción
- **Filtrado en tiempo real** mientras escribes

## Servicios Disponibles

### TicketService

```typescript
// Crear ticket
const response = await ticketService.createTicket(ticketData);

// Obtener todos los tickets
const tickets = await ticketService.getTickets();

// Obtener ticket por ID
const ticket = await ticketService.getTicketById(id);
```

### Hooks Personalizados

```typescript
// Hook para formulario de tickets
const { isLoading, error, success, submitTicket, resetState } = useTicketForm();

// Hook para estadísticas
const { total, enProceso, finalizados, isLoading, error } = useTicketStats();
```

## Configuración

### Variables de Entorno

La URL de la API está configurada en `lib/ticketService.ts`:

```typescript
const API_BASE_URL = 'https://monkfish-app-2et8k.ondigitalocean.app/api';
```

### Timeout

El timeout está configurado a 10 segundos para evitar peticiones colgadas.

## Características de UX/UI

### Dashboard
- **Diseño responsivo** que se adapta a diferentes pantallas
- **Estadísticas en tiempo real** con indicadores de carga
- **Navegación intuitiva** entre funcionalidades
- **Feedback visual** para todas las acciones

### Formulario de Creación
- **Validación en tiempo real** de campos requeridos
- **Indicador de carga** durante el envío
- **Prevención de envíos múltiples**
- **Mensajes de error** claros y específicos

### Seguimiento de Tickets
- **Búsqueda instantánea** sin necesidad de botón
- **Estadísticas visuales** con colores diferenciados
- **Modal de detalles** para información completa
- **Estados de carga** para todas las operaciones

## Manejo de Errores

El sistema maneja automáticamente:
- Errores de conexión de red
- Errores de servidor (400, 401, 403, 404, 500)
- Errores de validación
- Timeouts de petición
- Errores de carga de datos

## Mejoras Futuras

- [ ] Implementar paginación para listar tickets
- [ ] Agregar funcionalidad de edición de tickets
- [ ] Implementar filtros avanzados (por fecha, técnico, etc.)
- [ ] Agregar autenticación si es requerida
- [ ] Implementar caché de datos
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar notificaciones push
- [ ] Agregar exportación de datos (PDF, Excel)
- [ ] Implementar gráficos de estadísticas

## Dependencias

- `axios`: Para peticiones HTTP
- `react`: Para el framework de UI
- `typescript`: Para tipado estático
- `lucide-react`: Para iconos
- `@radix-ui/react-*`: Para componentes de UI

## Notas Técnicas

- La implementación usa el patrón Singleton para el servicio
- Se implementa manejo de errores centralizado
- Los tipos están completamente definidos para TypeScript
- El formulario es completamente responsivo
- Se previenen envíos múltiples durante la carga
- Las estadísticas se actualizan en tiempo real
- La búsqueda es instantánea y eficiente 
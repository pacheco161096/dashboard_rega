# Servicios de API

Este módulo contiene todos los servicios para interactuar con las APIs del sistema de cobranza.

## Servicios Disponibles

### GastoService

Gestiona operaciones relacionadas con gastos.

```typescript
import { gastoService } from "@/lib/services";

// Obtener gastos del día actual
const gastos = await gastoService.obtenerGastosDelDia("123");

// Obtener gastos por rango de fechas
const gastos = await gastoService.obtenerGastosPorRango(
  "123",
  "2024-01-01",
  "2024-01-31"
);

// Crear un nuevo gasto
const nuevoGasto = await gastoService.crearGasto({
  idusuario: "123",
  fecha: "2024-01-15",
  concepto: "Servicios",
  monto: "150.50",
  metodo: "Efectivo",
});

// Obtener un gasto por ID
const gasto = await gastoService.obtenerGastoPorId(1);

// Eliminar un gasto
await gastoService.eliminarGasto(1);
```

### VentaService

Gestiona operaciones relacionadas con ventas y transacciones.

```typescript
import { ventaService } from "@/lib/services";

// Obtener ventas del día actual
const ventas = await ventaService.obtenerVentasDelDia("123");

// Obtener transacciones del día actual
const transacciones = await ventaService.obtenerTransaccionesDelDia("123");

// Obtener una transacción específica
const transaccion = await ventaService.obtenerTransaccion(456);

// Procesar un pago
const resultado = await ventaService.procesarPago({
  idCliente: 789,
  idUsuario: "123",
  carshop: [
    {
      id: 1,
      idfactura: "FAC-001",
      titulo: "Servicio Mensual",
      precio: 500,
      cantidad: 1,
      type: "paquete",
      fecha: "2024-01-15",
    },
  ],
  metodo: "Efectivo",
  referencia: "REF-123", // Opcional, requerido si método != "Efectivo"
});

// Calcular total de ventas
const total = ventaService.calcularTotalVentas(transacciones);
```

### CajaService

Gestiona operaciones relacionadas con la caja.

```typescript
import { cajaService } from "@/lib/services";

// Abrir una nueva caja
const nuevaCaja = await cajaService.abrirCaja({
  montoApertura: 1000,
  fechaHoraApertura: new Date().toISOString(),
  employeeId: "123",
});

// Cerrar una caja
const cajaCerrada = await cajaService.cerrarCaja(1, {
  montoCierre: 1500,
  fechaHoraCierre: new Date().toISOString(),
  employeeId: "123",
});

// Obtener una caja por ID
const caja = await cajaService.obtenerCajaPorId(1);

// Utilidades
const montoApertura = cajaService.obtenerMontoApertura(caja);
const employeeId = cajaService.obtenerEmployeeId(caja);
const montoCierre = cajaService.calcularMontoCierre(
  1000, // montoApertura
  500, // totalVentas
  100 // totalGastos
);
```

### ClienteService

Gestiona operaciones relacionadas con clientes.

```typescript
import { clienteService } from "@/lib/services";

// Buscar cliente por ID
const cliente = await clienteService.buscarClientePorId("123");

// Utilidades
const tieneFacturas = clienteService.tieneFacturasPendientes(cliente);
const totalFacturas = clienteService.calcularTotalFacturasPendientes(cliente);
```

## Manejo de Errores

Todos los servicios lanzan errores que pueden ser manejados con `handleApiError`:

```typescript
import { gastoService, handleApiError } from "@/lib/services";
import { handleApiError } from "@/lib/api/config";

try {
  const gastos = await gastoService.obtenerGastosDelDia("123");
} catch (error) {
  const customError = handleApiError(error);
  console.error(customError.message);
  // customError.statusCode contiene el código de estado HTTP
}
```

## Ejemplo Completo: Flujo de Cobranza

```typescript
import {
  gastoService,
  ventaService,
  cajaService,
  clienteService,
} from "@/lib/services";
import { getTodayISO } from "@/lib/api/config";

async function flujoCobranzaCompleto() {
  const userId = "123";
  const fecha = getTodayISO();

  try {
    // 1. Obtener datos del día
    const [gastos, transacciones] = await Promise.all([
      gastoService.obtenerGastosDelDia(userId, fecha),
      ventaService.obtenerTransaccionesDelDia(userId, fecha),
    ]);

    // 2. Calcular totales
    const totalGastos = gastos.reduce(
      (sum, gasto) => sum + gasto.attributes.monto,
      0
    );
    const totalVentas = ventaService.calcularTotalVentas(transacciones);
    const subtotal = totalVentas - totalGastos;

    // 3. Buscar cliente y procesar pago
    const cliente = await clienteService.buscarClientePorId("789");

    if (clienteService.tieneFacturasPendientes(cliente)) {
      const resultado = await ventaService.procesarPago({
        idCliente: cliente.id,
        idUsuario: userId,
        carshop: cliente.Facturas!.map((factura) => ({
          id: factura.id,
          idfactura: factura.idfactura,
          titulo: factura.titulo,
          precio: factura.precio,
          cantidad: 1,
          type: "paquete",
          fecha: factura.fecha,
        })),
        metodo: "Efectivo",
      });

      console.log("Pago procesado:", resultado.pagoexitoso);
    }

    // 4. Cerrar caja
    const caja = await cajaService.obtenerCajaPorId(1);
    const montoCierre = cajaService.calcularMontoCierre(
      cajaService.obtenerMontoApertura(caja),
      totalVentas,
      totalGastos
    );

    await cajaService.cerrarCaja(caja.id, {
      montoCierre,
      fechaHoraCierre: new Date().toISOString(),
      employeeId: cajaService.obtenerEmployeeId(caja)!,
    });
  } catch (error) {
    const customError = handleApiError(error);
    console.error("Error en flujo de cobranza:", customError.message);
    throw customError;
  }
}
```

## Características

- ✅ Manejo centralizado de errores
- ✅ Validaciones de datos antes de enviar
- ✅ Tipos TypeScript completos
- ✅ Funciones utilitarias para cálculos comunes
- ✅ Soporte para operaciones en paralelo
- ✅ Documentación JSDoc completa

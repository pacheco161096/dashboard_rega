import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * Configuración de las APIs del sistema
 *
 * Este archivo centraliza todas las configuraciones de las APIs,
 * incluyendo URLs base, timeouts, headers y manejo de errores.
 */

// URLs base de las APIs
// Se pueden sobrescribir con variables de entorno
export const API_URLS = {
  CMS: process.env.NEXT_PUBLIC_CMS_API_URL || "https://cms.regatelecom.mx/api",
  BUSINESS:
    process.env.NEXT_PUBLIC_BUSINESS_API_URL ||
    "https://monkfish-app-2et8k.ondigitalocean.app/api",
    MIKROTIK:
    process.env.NEXT_PUBLIC_MIKROTIK_API_URL ||
    "http://yg8ss8csc0kcs4c8cs00g4gw.72.60.117.117.sslip.io",
} as const;

// Configuración por defecto
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

/**
 * Headers por defecto para todas las peticiones
 */
const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

/**
 * Maneja errores de manera consistente en toda la aplicación
 */
export const handleApiError = (error: unknown): Error => {
  let errorMessage = "Error desconocido";
  let statusCode: number | undefined;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // Error de respuesta del servidor
      statusCode = axiosError.response.status;
      const data = axiosError.response.data as ApiErrorResponse | unknown;

      switch (statusCode) {
        case 400:
          errorMessage =
            (data as ApiErrorResponse)?.error?.message ||
            "Datos inválidos enviados al servidor";
          break;
        case 401:
          errorMessage = "No autorizado. Por favor, inicia sesión nuevamente";
          break;
        case 403:
          errorMessage =
            "Acceso prohibido. No tienes permisos para realizar esta acción";
          break;
        case 404:
          errorMessage = "Recurso no encontrado";
          break;
        case 422:
          errorMessage =
            (data as ApiErrorResponse)?.error?.message ||
            "Error de validación en los datos enviados";
          break;
        case 500:
          errorMessage =
            "Error interno del servidor. Por favor, intenta más tarde";
          break;
        case 503:
          errorMessage = "Servicio no disponible temporalmente";
          break;
        default:
          errorMessage =
            (data as ApiErrorResponse)?.error?.message ||
            `Error ${statusCode}: ${axiosError.response.statusText}`;
      }
    } else if (axiosError.request) {
      // Error de red (sin respuesta del servidor)
      errorMessage = "Error de conexión. Verifica tu conexión a internet";
    } else {
      // Error de configuración
      errorMessage =
        axiosError.message || "Error de configuración en la petición";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const customError = new Error(errorMessage) as Error & {
    statusCode?: number;
    originalError?: unknown;
  };
  customError.statusCode = statusCode;
  customError.originalError = error;

  return customError;
};

/**
 * Interceptor para agregar token de autenticación si existe
 */
const authInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  // Obtener token del sessionStorage si existe
  try {
    const loginUser = sessionStorage.getItem("loginUser");
    if (loginUser) {
      // Si en el futuro necesitas agregar un token de autenticación, aquí es donde lo harías
      // const user = JSON.parse(loginUser);
      // config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch {
    // Ignorar errores al leer sessionStorage en el interceptor
  }

  return config;
};

/**
 * Crea una instancia de axios configurada para una API específica
 *
 * @param baseURL - URL base de la API
 * @param timeout - Timeout en milisegundos (opcional)
 * @returns Instancia de axios configurada
 */
export const createApiInstance = (
  baseURL: string,
  timeout: number = API_CONFIG.TIMEOUT
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: getDefaultHeaders(),
  });

  // Interceptores de request
  instance.interceptors.request.use(authInterceptor);

  // Interceptores de response
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(error)
  );

  return instance;
};

/**
 * Instancia de axios para la API del CMS (Strapi)
 * Usada para: gastos, ventas, transacciones, cajas, etc.
 */
export const cmsApi = createApiInstance(API_URLS.CMS);

/**
 * Instancia de axios para la API de negocio
 * Usada para: pagos, búsqueda de usuarios, tickets, etc.
 */
export const businessApi = createApiInstance(API_URLS.BUSINESS);

/**
 * Instancia de axios para la API de Mikrotik
 * Usada para: mikrotik, etc.
 */
export const mikrotikApi = createApiInstance(API_URLS.MIKROTIK);

/**
 * Tipos para respuestas comunes de la API
 */
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface ApiErrorResponse {
  error: {
    status: number;
    name: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Utilidad para construir queries de filtros para Strapi
 */
export const buildStrapiFilters = (
  filters: Record<string, string | number | boolean | undefined>
): string => {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(`filters[${key}]`, String(value));
    }
  });

  return queryParams.toString();
};

/**
 * Utilidad para construir queries de fecha para Strapi
 */
export const buildDateRangeFilter = (
  field: string,
  startDate: string,
  endDate: string
): string => {
  return `filters[${field}][$gte]=${startDate}T00:00:00.000Z&filters[${field}][$lte]=${endDate}T23:59:59.999Z`;
};

/**
 * Utilidad para obtener la fecha actual en formato ISO (solo fecha)
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Utilidad para formatear fechas para queries de Strapi
 */
export const formatDateForStrapi = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString();
};

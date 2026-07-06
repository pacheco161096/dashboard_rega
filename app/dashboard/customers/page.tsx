'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button, SearchBox, Table, CreateCustomer, CustomerForm } from "@/components/index";
import s from './customers.module.css'
import { useRouter } from "next/navigation";
import { getUserPermissions } from "@/lib/roles";
import {
  customersService,
  CustomerListItem,
  ServiceStatusFilter,
  PaginationMeta,
} from "@/lib/services/customersService";
import {
  ESTADO_SERVICIO_API_HABILITADO,
  SERVICE_STATUS_FILTERS,
} from "@/lib/utils/customerServiceStatus";
import { useToast } from "@/hooks/use-toast";
import { SESSION_KEYS } from "@/lib/auth/session";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal/ConfirmActionModal";

export type Role = {
  id: number;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export type Factura = {
  id: number;
  fecha: string;
  pagado: boolean;
  id_paquete: string;
  idTransaccion: string | null;
  titulo: string;
  precio: number;
  idfactura: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  nombre: string;
  apellido: string;
  rfc: string;
  celular: string;
  curp: string;
  razon_social: string;
  regimen_fiscal: string;
  cfdi: string | null;
  colonia: string;
  codigo_postal: string;
  calle: string;
  num_exterior: string;
  num_interior: string;
  ciudad: string;
  localidad: string;
  estado: string;
  pais: string;
  tipo_servicio_paquete: string;
  estatus_servicio: boolean;
  estado_servicio?: string | null;
  createdAt: string;
  updatedAt: string;
  id_mikrotik: string;
  recargo: boolean;
  role: Role;
  Facturas: Factura[];
  paqueteActual: CurrentPlan;
};

export type CurrentPlan = {
  id: string;
  titulo: string;
  precio: number;
}

const SEARCH_DEBOUNCE_MS = 400;
const ITEMS_PER_PAGE = 10;

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: ITEMS_PER_PAGE,
  pageCount: 1,
  total: 0,
};

type ListCache = {
  key: string;
  items: CustomerListItem[];
};

function slicePage(items: CustomerListItem[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function buildPagination(total: number, page: number, pageSize: number): PaginationMeta {
  return {
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    total,
  };
}

/** Tiempo para que Radix Dialog termine de desmontar el portal antes de quitar el componente */
const DIALOG_UNMOUNT_DELAY_MS = 300;

export default function Customers() {
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [clientModalMounted, setClientModalMounted] = useState(false)
  const [updateCliente, setUpdateCliente] = useState<User[] | null>(null)
  const [idCliente, setIdCliente] = useState<string | number>("")
  const [isNewCliente, setIsNewCliente] = useState(false)

  const [data, setData] = useState<CustomerListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState<ServiceStatusFilter>("activos");

  const [clienteToDelete, setClienteToDelete] = useState<CustomerListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const listCacheRef = useRef<ListCache | null>(null);
  const fetchIdRef = useRef(0);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const permissions = useMemo(() => getUserPermissions(), []);
  const cacheKey = `${serviceStatusFilter}|${debouncedSearch}`;
  const prevCacheKeyRef = useRef(cacheKey);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const applyCachedPage = useCallback((page: number) => {
    const cache = listCacheRef.current;
    if (!cache || cache.key !== cacheKey) return false;

    setData(slicePage(cache.items, page, ITEMS_PER_PAGE));
    setPagination(buildPagination(cache.items.length, page, ITEMS_PER_PAGE));
    setFetchError(null);
    setLoading(false);
    setIsPageChanging(false);
    return true;
  }, [cacheKey]);

  const fetchData = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const requestId = ++fetchIdRef.current;

    // Paginación instantánea desde caché (API devolvió listado completo)
    if (listCacheRef.current?.key === cacheKey) {
      applyCachedPage(currentPage);
      return;
    }

    if (!silent) {
      setLoading(true);
    } else {
      setIsPageChanging(true);
    }
    setFetchError(null);

    try {
      const result = await customersService.fetchCustomersList({
        statusFilter: serviceStatusFilter,
        search: debouncedSearch,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      });

      if (requestId !== fetchIdRef.current) return;

      if (result.usedClientPagination) {
        listCacheRef.current = { key: cacheKey, items: result.data };
        setData(slicePage(result.data, currentPage, ITEMS_PER_PAGE));
        setPagination(buildPagination(result.data.length, currentPage, ITEMS_PER_PAGE));
      } else {
        listCacheRef.current = null;
        setData(result.data);
        setPagination(result.pagination);

        if (
          result.pagination.pageCount > 0 &&
          currentPage > result.pagination.pageCount
        ) {
          setCurrentPage(result.pagination.pageCount);
        }
      }
    } catch (err) {
      if (requestId !== fetchIdRef.current) return;
      const message = err instanceof Error ? err.message : "Error al cargar clientes"
      setFetchError(message)
      setData([]);
      setPagination(EMPTY_PAGINATION);
      listCacheRef.current = null;
      toastRef.current({
        title: "Error al cargar clientes",
        description: message,
        variant: "destructive",
      })
    } finally {
      if (requestId === fetchIdRef.current) {
        setLoading(false);
        setIsPageChanging(false);
      }
    }
  }, [serviceStatusFilter, debouncedSearch, currentPage, cacheKey, applyCachedPage]);

  useEffect(() => {
    // Cambio de página con lista ya en memoria: sin red
    if (listCacheRef.current?.key === cacheKey) {
      applyCachedPage(currentPage);
      return;
    }

    const filterChanged = prevCacheKeyRef.current !== cacheKey;
    prevCacheKeyRef.current = cacheKey;
    if (filterChanged) {
      listCacheRef.current = null;
    }

    // Spinner completo solo al cambiar filtro/búsqueda; paginación en servidor es suave
    fetchData({ silent: !filterChanged && data.length > 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, currentPage]);

  const clearUnmountTimer = useCallback(() => {
    if (unmountTimerRef.current) {
      clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearUnmountTimer(), [clearUnmountTimer]);

  const handleClientModalOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        clearUnmountTimer();
        setClientModalMounted(true);
        setClientModalOpen(true);
        return;
      }

      // Cerrar el Dialog primero; desmontar después para evitar removeChild en el portal
      setClientModalOpen(false);
      clearUnmountTimer();
      unmountTimerRef.current = setTimeout(() => {
        setClientModalMounted(false);
        setUpdateCliente(null);
        setIsNewCliente(false);
        listCacheRef.current = null;
        fetchData();
        unmountTimerRef.current = null;
      }, DIALOG_UNMOUNT_DELAY_MS);
    },
    [clearUnmountTimer, fetchData]
  );

  const handleNewCliente = useCallback(() => {
    clearUnmountTimer();
    setIsNewCliente(true);
    setUpdateCliente(null);
    setClientModalMounted(true);
    setClientModalOpen(true);
  }, [clearUnmountTimer]);

  const handleUpdateCliente = useCallback(
    (rows: CustomerListItem[]) => {
      clearUnmountTimer();
      setUpdateCliente(rows as unknown as User[]);
      setIdCliente(rows[0]?.id);
      setIsNewCliente(false);
      setClientModalMounted(true);
      setClientModalOpen(true);
    },
    [clearUnmountTimer]
  );

  const handleRegisterPay = useCallback((user: CustomerListItem[]) => {
    const storedCaja = sessionStorage.getItem(SESSION_KEYS.CAJA);

    if (!storedCaja) {
      toastRef.current({
        title: "Caja cerrada",
        description: "Debes abrir una caja en Cobranza antes de registrar un pago.",
        variant: "destructive",
      });
      router.replace("/dashboard/cobranza");
      return;
    }

    sessionStorage.setItem(SESSION_KEYS.SELECTED_USER, JSON.stringify(user));
    router.replace("/dashboard/cobranza");
  }, [router]);

  const handleCreateTicket = useCallback((user: CustomerListItem[]) => {
    const clienteId = user[0]?.id?.toString() || "";
    router.push(`/dashboard/reportes?create=true&clienteId=${clienteId}`);
  }, [router]);

  const handleRequestDeleteCliente = useCallback((users: CustomerListItem[]) => {
    const cliente = users[0];
    if (!cliente) return;
    setClienteToDelete(cliente);
  }, []);

  const handleConfirmDeleteCliente = useCallback(async () => {
    if (!clienteToDelete) return;

    setIsDeleting(true);
    try {
      await customersService.deleteCustomer(clienteToDelete.id);
      toastRef.current({
        title: "Cliente eliminado",
        description: `${clienteToDelete.nombre || "El cliente"} fue eliminado correctamente.`,
      });
      setClienteToDelete(null);

      // Invalidar caché y recargar
      listCacheRef.current = null;
      await fetchData();
    } catch (err) {
      toastRef.current({
        title: "Error al eliminar",
        description: err instanceof Error ? err.message : "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [clienteToDelete, fetchData]);

  const handleFilter = useCallback((item: string) => {
    setSearchQuery(item);
  }, []);

  const handleServiceStatusFilter = useCallback((filter: ServiceStatusFilter) => {
    listCacheRef.current = null;
    setServiceStatusFilter(filter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const totalPages = Math.max(1, pagination.pageCount);
  const totalItems = pagination.total;
  const pageSize = pagination.pageSize || ITEMS_PER_PAGE;
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const tableData = data as unknown as User[];
  const clienteNombre = [clienteToDelete?.nombre, clienteToDelete?.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  const pageButtons = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => {
      return (
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 1 && page <= currentPage + 1)
      );
    });
  }, [totalPages, currentPage]);

  return (
    <div className="w-full h-full">
      {/* Montar solo al abrir; desmontar con delay para no romper el portal de Radix Dialog */}
      {clientModalMounted && isNewCliente && (
        <CreateCustomer open={clientModalOpen} onOpenChange={handleClientModalOpenChange} />
      )}
      {clientModalMounted && !isNewCliente && (
        <CustomerForm
          open={clientModalOpen}
          onOpenChange={handleClientModalOpenChange}
          mode="edit"
          userData={updateCliente}
          userId={idCliente}
        />
      )}

      <ConfirmActionModal
        open={!!clienteToDelete}
        title="¿Eliminar cliente?"
        description={
          <>
            ¿Estás seguro de que deseas eliminar al cliente{" "}
            <strong>{clienteNombre || `#${clienteToDelete?.id}`}</strong>? Esta acción no se
            puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteCliente}
        onCancel={() => {
          if (!isDeleting) setClienteToDelete(null);
        }}
      />

      <div className={s.header}>
        {permissions?.canCreateClient && (
          <Button onClick={handleNewCliente} variant="primary" size="md" className={s.newClientButton}>
            <i className="fa-solid fa-plus text-sm"></i>
            <span>Nuevo Cliente</span>
          </Button>
        )}
        <div className={s.headerActions}>
          <div className={s.searchWrapper}>
            <SearchBox handleFilter={handleFilter} />
          </div>
          <div className={s.filters}>
            {SERVICE_STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleServiceStatusFilter(value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  serviceStatusFilter === value
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 w-full">
        {loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 text-sm font-medium">Cargando clientes...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <p className="text-red-600 mb-2">{fetchError}</p>
            <button
              type="button"
              onClick={() => {
                listCacheRef.current = null;
                fetchData();
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${isPageChanging ? "opacity-70" : ""}`}>
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <i className="fa-regular fa-users text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg font-medium mb-2">No se encontraron clientes</p>
                <p className="text-gray-400 text-sm text-center">
                  {serviceStatusFilter === "cancelados" && !ESTADO_SERVICIO_API_HABILITADO
                    ? "El estatus Cancelado estará disponible cuando la API lo soporte"
                    : searchQuery || serviceStatusFilter !== "todos"
                      ? "Prueba con otro filtro o término de búsqueda"
                      : "Comienza agregando tu primer cliente"}
                </p>
              </div>
            ) : (
              <>
                <Table
                  data={tableData}
                  handleUpdateCliente={handleUpdateCliente as (user: User[]) => void}
                  handleRegisterPay={handleRegisterPay as (user: User[]) => void}
                  handleCreateTicket={handleCreateTicket as (user: User[]) => void}
                  handleDeleteCliente={handleRequestDeleteCliente as (user: User[]) => void}
                />
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Mostrando {rangeStart} - {rangeEnd} de {totalItems} clientes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      <div className="flex items-center gap-1">
                        {pageButtons.map((page, index, array) => {
                          const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsis && (
                                <span className="px-2 text-gray-500">...</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handlePageChange(page)}
                                disabled={loading}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                  currentPage === page
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

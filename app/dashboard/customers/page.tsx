'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button, SearchBox, Table, CreateCustomer, CustomerForm } from "@/components/index";
import s from './customers.module.css'
import { useRouter } from "next/navigation";
import { getUserPermissions } from "@/lib/roles";
import {
  customersService,
  CustomerListItem,
  ServiceStatusFilter,
} from "@/lib/services/customersService";
import {
  ESTADO_SERVICIO_API_HABILITADO,
  SERVICE_STATUS_FILTERS,
} from "@/lib/utils/customerServiceStatus";

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
  /** Campo futuro: 'activo' | 'suspendido' | 'cancelado' */
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

export default function Customers() {
  const [showModalClient, setShowModalClient] = useState(false)
  const [updateCliente, setUpdateCliente] = useState<User[]>()
  const [idCliente, setIdCliente] = useState<string | number>("")
  const [isNewCliente, setIsNewCliente] = useState(false)

  const [data, setData] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState<ServiceStatusFilter>("activos");
  const itemsPerPage = 10;
  const router = useRouter();
  const permissions = getUserPermissions();
  const prevModalOpen = useRef(showModalClient);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const users = await customersService.fetchCustomersList({
        statusFilter: serviceStatusFilter,
        search: debouncedSearch,
      });
      setData(users);
    } catch (err) {
      console.error("Error al cargar clientes:", err)
      setFetchError(err instanceof Error ? err.message : "Error al cargar clientes")
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [serviceStatusFilter, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (prevModalOpen.current && !showModalClient) {
      fetchData();
    }
    prevModalOpen.current = showModalClient;
  }, [showModalClient, fetchData]);

  const handleModalClient = useCallback(() => {
    setShowModalClient(!showModalClient)
  }, [showModalClient])

  const handleNewCliente = useCallback(() => {
    setIsNewCliente(true)
    setUpdateCliente([])
    setShowModalClient(!showModalClient)
  }, [showModalClient])

  const handleUpdateCliente = useCallback((data: CustomerListItem[]) => {
    setUpdateCliente(data as unknown as User[])
    setIdCliente(data[0]?.id)
    setIsNewCliente(false);
    setShowModalClient(prev => !prev);
  }, []);

  const handleRegisterPay = (user: CustomerListItem[]) => {
    const storedCaja = sessionStorage.getItem("caja");

    if (storedCaja) {
      sessionStorage.setItem("selectedUser", JSON.stringify(user));
    }

    router.replace("/dashboard/cobranza");
  };

  const handleCreateTicket = useCallback((user: CustomerListItem[]) => {
    const clienteId = user[0]?.id?.toString() || "";
    router.push(`/dashboard/reportes?create=true&clienteId=${clienteId}`);
  }, [router]);

  const handleFilter = useCallback((item: string) => {
    setSearchQuery(item);
  }, []);

  const handleServiceStatusFilter = useCallback((filter: ServiceStatusFilter) => {
    setServiceStatusFilter(filter);
    setCurrentPage(1);
  }, []);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);

  const tableData = paginatedData as unknown as User[];

  return (
    <div className="w-full h-full">
      {isNewCliente ? <CreateCustomer open={showModalClient} onOpenChange={handleModalClient} /> : <CustomerForm open={showModalClient} onOpenChange={handleModalClient} mode="edit" userData={updateCliente ? updateCliente : null} userId={idCliente}/>}

      <div className={s.header}>
        {permissions?.canCreateClient && (
          <Button onClick={handleNewCliente} variant="primary" size="md" className="flex items-center gap-2 shrink-0">
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
        {loading ? (
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
              onClick={fetchData}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                />
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, data.length)} de {data.length} clientes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            return page === 1 ||
                                   page === totalPages ||
                                   (page >= currentPage - 1 && page <= currentPage + 1);
                          })
                          .map((page, index, array) => {
                            const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                            return (
                              <div key={page} className="flex items-center gap-1">
                                {showEllipsis && (
                                  <span className="px-2 text-gray-500">...</span>
                                )}
                                <button
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                    currentPage === page
                                      ? 'bg-indigo-600 text-white'
                                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
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

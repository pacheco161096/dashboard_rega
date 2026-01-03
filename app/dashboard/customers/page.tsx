'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, SearchBox, Table, CreateCustomer,CustomerForm} from "@/components/index";
import axios from 'axios';
import s from './customers.module.css'
import { useRouter } from "next/navigation";

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

export default function Customers() {

  const [showModalClient, setShowModalClient] = useState(false)
  const [updateCliente, setUpdateCliente] = useState<User[]>()
  const [idCliente, setIdCliente] = useState<string | number>("")
  const [isNewCliente, setIsNewCliente] = useState(false)

  const URL = ("https://monkfish-app-2et8k.ondigitalocean.app/api/users?populate=*")
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(URL);
      const users = response.data || [];
      setData(users);
    } catch (err) {
      console.log('error' + err)
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [showModalClient, fetchData]);

  /* Clientes */

  const handleModalClient = useCallback(() => {
    setShowModalClient(!showModalClient)
  }, [showModalClient])

  const handleNewCliente = useCallback(() => {
    setIsNewCliente(true)
    setUpdateCliente([])
    setShowModalClient(!showModalClient)
  }, [showModalClient])

  const handleUpdateCliente = useCallback((data: User[]) => {  
    setUpdateCliente(data)
    setIdCliente(data[0]?.id)
    setIsNewCliente(false);
    setShowModalClient(prev => !prev);
  }, []); // 🔹 Sin dependencias para evitar renders innecesarios

  /* Pagos */

  const handleRegisterPay = (user: User[]) => {
    const storedCaja = sessionStorage.getItem("caja");

    if (storedCaja) {
      sessionStorage.setItem("selectedUser", JSON.stringify(user));
    }
    
    router.replace("/dashboard/cobranza");
  };

  const handleFilter = useCallback((item: string) => {
    setSearchQuery(item);
    setCurrentPage(1); // Resetear a la primera página al buscar
  }, []);

  // Filtrar datos basado en la búsqueda (busca en todos los clientes)
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const normalized = searchQuery.trim().toLowerCase();
    
    return data.filter((user) => {
      const matchId = user.id.toString().includes(normalized);
      const matchName = user.nombre?.toLowerCase().includes(normalized);
      const matchEmail = user.email?.toLowerCase().includes(normalized);
      const matchApellido = user.apellido?.toLowerCase().includes(normalized);
      const matchCelular = user.celular?.includes(normalized);
      
      return matchId || matchName || matchEmail || matchApellido || matchCelular;
    });
  }, [data, searchQuery]);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCustomers.length / itemsPerPage);
  }, [filteredCustomers.length, itemsPerPage]);

  return (
    <div className="w-full h-full">
      {isNewCliente ? <CreateCustomer open={showModalClient} onOpenChange={handleModalClient} /> : <CustomerForm open={showModalClient} onOpenChange={handleModalClient} mode="edit" userData={updateCliente ? updateCliente : null} userId={idCliente}/>}
      
      {/* Header con acciones */}
      <div className={s.header}>
        <Button onClick={handleNewCliente} variant="primary" size="md" className="flex items-center gap-2">
          <i className="fa-solid fa-plus text-sm"></i>
          <span>Nuevo Cliente</span>
        </Button>
        <SearchBox handleFilter={handleFilter} />
      </div>

      {/* Espaciado y contenedor de la tabla */}
      <div className="mt-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 text-sm font-medium">Cargando clientes...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {(!data || data.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <i className="fa-regular fa-users text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg font-medium mb-2">No hay clientes registrados</p>
                <p className="text-gray-400 text-sm text-center">Comienza agregando tu primer cliente</p>
              </div>
            ) : (
              <>
                <Table 
                  data={paginatedData} 
                  handleUpdateCliente={handleUpdateCliente} 
                  handleRegisterPay={handleRegisterPay}
                />
                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length} clientes
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
                            // Mostrar primera, última, actual y adyacentes
                            return page === 1 || 
                                   page === totalPages || 
                                   (page >= currentPage - 1 && page <= currentPage + 1);
                          })
                          .map((page, index, array) => {
                            // Agregar puntos suspensivos si hay gap
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

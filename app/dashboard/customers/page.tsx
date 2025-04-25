'use client'

import { useState, useEffect, useCallback } from "react";
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
  const [data, setData] = useState<User[]>();
  const [filterData, setFilterData] = useState<User[]>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
    setLoading(false);
  }, [showModalClient]);

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(URL);
      setData(response.data);
    } catch (err) {
      console.log('error' + err)
    } finally {
      setLoading(false);
    }
  };

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
    if (!data || !item) return;
  
    const normalized = item.trim().toLowerCase();
  
    const filtered = data.filter((user) => {
      const matchId = user.id.toString() === normalized;
      const matchName = user.nombre?.toLowerCase() === normalized;
      const matchEmail = user.email?.toLowerCase() === normalized;
      return matchId || matchName || matchEmail;
    });
  
    // Solo actualiza si hay diferencia con el estado actual
    const isSame = filtered.length === data.length && filtered.every((u, i) => u.id === data[i].id);
  
    if (filtered.length && !isSame) {
      setFilterData(filtered);
    } else {
      setFilterData(data);
    }
  }, [data]);

  return (
    <div className="">
      {isNewCliente ? <CreateCustomer open={showModalClient} onOpenChange={handleModalClient} /> : <CustomerForm open={showModalClient} onOpenChange={handleModalClient} mode="edit" userData={updateCliente ? updateCliente : null} userId={idCliente}/>}
      
      <div className={s.header}>
        <Button onClick={handleNewCliente} variant="primary" size="md">Nuevo Cliente</Button>
   
        <SearchBox handleFilter={handleFilter} />
      </div>

      {loading && <span>Cargando...</span>}
      {!loading && (
        <Table data={filterData || data} handleUpdateCliente={handleUpdateCliente} handleRegisterPay={handleRegisterPay}/>
      )}
    </div>
  );
}

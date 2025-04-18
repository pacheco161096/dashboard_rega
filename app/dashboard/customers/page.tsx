'use client'

import { useState, useEffect, useCallback } from "react";
import { Button, SearchBox, Table, CreateCustomer, UpdateCustomer} from "@/components/index";
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
    setIsNewCliente(false);
    setShowModalClient(prev => !prev);
  }, []); // 🔹 Sin dependencias para evitar renders innecesarios

  /* Pagos */

  const handleRegisterPay = (user: User[]) => {
    sessionStorage.setItem("selectedUser", JSON.stringify(user));
    router.replace("/dashboard/cobranza");
  };

  const handleFilter = useCallback((item: string) => {
    const user = data && data.filter((a) => a.id === parseInt(item) || a.nombre === item || a.email === item)
    if (user?.length) {
      if (JSON.stringify(user) !== JSON.stringify(data)) {
        setFilterData(user);
      }
    } else {
      setFilterData([]);
    }
  }, [data])

  return (
    <div className="">
      {isNewCliente ? <CreateCustomer open={showModalClient} onOpenChange={handleModalClient} /> : <UpdateCustomer  data={ updateCliente ? updateCliente : null } />}
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

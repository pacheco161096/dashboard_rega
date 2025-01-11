'use client'

import { useState, useEffect, useCallback } from "react";

import { Button, Modal, SearchBox, Table, CreateCustomer, UpdateCustomer, RegisterPay } from "@/components";

import axios from 'axios';

import s from './customers.module.css'

export default function Customers() {

  const [showModalClient, setShowModalClient] = useState(false)
  const [showModalPay, setShowModalPay] = useState(false)
  const [updateCliente, setUpdateCliente] = useState([])
  const [isNewCliente, setIsNewCliente] = useState(false)

  const URL = ("https://monkfish-app-2et8k.ondigitalocean.app/api/users?populate=*")
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdateCliente = useCallback((data: []) => {
    setUpdateCliente(data)
    setIsNewCliente(false)
    setShowModalClient(!showModalClient)
  }, [showModalClient])

  /* Pagos */

  const handleModalPay = useCallback(() => {
    setShowModalPay(!showModalPay)
  }, [showModalPay]);

  const handleRegisterPay = useCallback((user: any) => {
    setUpdateCliente(user);
    setShowModalPay(!showModalPay)
  }, [showModalPay])

  const handleFilter = useCallback((item: string) => {
    const user = data.filter((a) => a.id === parseInt(item) || a.nombre === item || a.email === item)
    if (JSON.stringify(user) !== JSON.stringify(data) && user.length > 0) {
      setFilterData(user);
    }
    if (user.length === 0) {
      setFilterData([]);
    }
  }, [data])

  return (
    <div className="">
      {
        showModalClient == true &&
        <Modal handleModal={handleModalClient}>
          {isNewCliente ? <CreateCustomer handleModal={handleModalClient} /> : <UpdateCustomer data={updateCliente} />}
        </Modal>
      }

      {
        showModalPay &&
        <Modal handleModal={handleModalPay}>
          <RegisterPay handleModal={handleModalPay} selectedUser={ updateCliente } />
        </Modal>
      }


      <div className={s.header}>
        <Button onClick={handleNewCliente} variant="primary" size="md">Nuevo Cliente</Button>
        <SearchBox handleFilter={handleFilter} />
      </div>

      {
        loading ? <span>Cargandoo..</span> : <Table data={filterData.length > 0 ? filterData : data} handleUpdateCliente={handleUpdateCliente} handleRegisterPay={handleRegisterPay} />
      }
    </div>
  );
}

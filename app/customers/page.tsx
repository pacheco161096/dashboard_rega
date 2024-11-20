'use client'

import { useState,useEffect, useCallback } from "react";

import { Button, Modal, SearchBox, Table,UpdateCustomer } from "@/components";

import axios from 'axios';

import s from './customers.module.css'

export default function Customers() {
  
const [isActive, setIsActive] = useState(false)
const [updateCliente,setUpdateCliente] = useState([])
const [isNewCliente,setIsNewCliente] = useState(false)

  const URL=("https://monkfish-app-2et8k.ondigitalocean.app/api/users?populate=*")
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    setLoading(false);
  }, [isActive]);

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

const handleModal = useCallback( () => {
  setIsActive(!isActive)
},[isActive])

const handleNewCliente = useCallback( () => {
  setIsNewCliente(true)
  setUpdateCliente([])
  setIsActive(!isActive)
},[isActive])

const handleUpdateCliente = useCallback( (data:[]) => {
  setUpdateCliente(data)
  setIsNewCliente(false)
  setIsActive(!isActive)
},[isActive])

const handleFilter = useCallback( (item:string) => {
    const user = data.filter((a) => a.id === parseInt(item) ||  a.nombre === item || a.email === item)
    if (JSON.stringify(user) !== JSON.stringify(data) && user.length > 0) {
      setFilterData(user);
    }
    if(user.length === 0) {
      setFilterData([]);
    }
},[data])

  return (
    <div className="">
      {
        isActive == true && 
        <Modal handleModal={handleModal}>
          {isNewCliente ? <div>Crear clientes</div> : <UpdateCustomer data={updateCliente}/>}  
        </Modal>
      }

        <div className={s.header}> 
          <Button onClick={handleNewCliente} variant="primary" size="md">Nuevo Cliente</Button>
          <SearchBox handleFilter={handleFilter} />
        </div>

      {
        loading ? <span>Cargandoo..</span> :  <Table data={filterData.length > 0 ? filterData : data} handleUpdateCliente={handleUpdateCliente} />
      }
    </div>
  );
}

'use client'

import { useState,useEffect, useCallback } from "react";

import { Button, Modal, SearchBox, Table } from "@/components";

import axios from 'axios';

import s from './customers.module.css'

export default function Customers() {
  
const [isActive, setIsActive] = useState(false)
const [updateCliente,setUpdateCliente] = useState([])

  const URL=("https://monkfish-app-2et8k.ondigitalocean.app/api/users/")
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

  const handleUpdateCliente = (data:[]) => {
    setUpdateCliente(data)
    setIsActive(!isActive)
}

const handleModal = useCallback( () => {
  setIsActive(!isActive)
  setUpdateCliente([])
},[isActive])


const handleFilter = useCallback( (item:string) => {
  console.log(data)
    const user = data.filter((a) => a.id === parseInt(item) ||  a.nombre === item)
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
          {updateCliente  ?   <div>Updates clientes</div> : <div>Crear clientes</div>}  
        </Modal>
      }

        <div className={s.header}> 
          <Button onClick={handleModal} variant="primary" size="md">Nuevo Cliente</Button>
          <SearchBox handleFilter={handleFilter} />
        </div>

      {
        loading ? <span>Cargandoo..</span> :  <Table data={filterData.length > 0 ? filterData : data} handleUpdateCliente={handleUpdateCliente} />
      }
    </div>
  );
}

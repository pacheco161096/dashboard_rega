'use client'

import { FC } from "react"

import s from './updateCustomer.module.css'

import { Input } from "@/components/atoms/Input/Input"

export interface UpdateCustomerProps {
data?:[]
}

export const UpdateCustomer:FC<UpdateCustomerProps> = (props) => {
  const {data} = props

  const userInformation = [
    {
        name:'lastname',
            required:true,
            placeholder:'Apellido',
            label:'Apellido',
            type:'text',
            defaultValue:'',
            size:'half',
            value:data.apellido,
            errorMessageEmpty:'Ingrese Apellido'
        },
        {
            name:'name',
            required:true,
            placeholder:'Nombre',
            label:'Nombre',
            type:'text',
            defaultValue:'',
            size:'half',
            value:data.nombre,
            errorMessageEmpty:'Ingrese Nombre'
        },
        {
            name:'email',
            required:true,
            placeholder:'Correo Electrónico',
            label:'Correo Electrónico',
            type:'email',
            defaultValue:'',
            size:'half',
            value:data.email,
            errorMessageEmpty:'Ingrese Correo Electrónico'
        },   
    ]

  console.log(data)
  return (
    <div className={s.container}>
      <form action="">
        {
            userInformation.map((item,key)=>(
                <Input key={key} value={item.value} required={item.required} name={item.name} placeHolder={item.placeholder} type={item.type} label={item.label} size={item.size}/>
            ))
        }
      </form>
    </div>
      )
}
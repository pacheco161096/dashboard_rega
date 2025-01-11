'use client'

import { FC,useCallback } from "react"

import s from './UpdateCustomer.module.css'

import { Input } from "@/components/atoms/Input/Input"

export interface UpdateCustomerProps {
  data: any[]
}

export const UpdateCustomer:FC<UpdateCustomerProps> = (props) => {
  const {data} = props
console.log(data)
  const userInformation = [
    {
        name:'lastname',
            required:true,
            placeholder:data.apellido,
            label:'Apellido',
            type:'text',
            defaultValue:'',
            size:'half',
            errorMessageEmpty:'Ingrese Apellido'
        },
        {
            name:'name',
            required:true,
            placeholder:data?.nombre,
            label:'Nombre',
            type:'text',
            defaultValue:'',
            size:'half',
            errorMessageEmpty:'Ingrese Nombre'
        },
        {
            name:'email',
            required:true,
            placeholder:data.email,
            label:'Correo Electrónico',
            type:'email',
            defaultValue:'',
            size:'half',
            errorMessageEmpty:'Ingrese Correo Electrónico'
        },   
        {
          name:'celular',
          required:true,
          placeholder:data.celular,
          label:'Celular',
          type:'text',
          defaultValue:'',
          size:'half',
          errorMessageEmpty:'Ingrese celular'
      },{
        name:'calle',
        required:true,
        placeholder:data.calle,
        label:'calle',
        type:'text',
        defaultValue:'',
        size:'half',
        errorMessageEmpty:'Ingrese calle'
    },{
      name:'cfdi',
      required:true,
      placeholder:data.cfdi,
      label:'cfdi',
      type:'text',
      defaultValue:'',
      size:'half',
      errorMessageEmpty:'Ingrese cfdi'
  }, {
    name:'ciudad',
    required:true,
    placeholder:data.ciudad,
    label:'ciudad',
    type:'text',
    defaultValue:'',
    size:'half',
    errorMessageEmpty:'Ingrese ciudad'
},{
  name:'codigo_postal',
  required:true,
  placeholder:data.codigo_postal,
  label:'codigo postal',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese codigo_postal'
},{
  name:'colonia',
  required:true,
  placeholder:data.colonia,
  label:'colonia',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese colonia'
},{
  name:'curp',
  required:true,
  placeholder:data.curp,
  label:'curp',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese curp'
},{
  name:'localidad',
  required:true,
  placeholder:data.localidad,
  label:'localidad',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese localidad'
},{
  name:'estado',
  required:true,
  placeholder:data.estado,
  label:'estado',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese estado'
},
{
  name:'numero_exterior',
  required:true,
  placeholder:data.num_exterior,
  label:'numero exterior',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese num_exterior'
},
{
  name:'numero_interior',
  required:true,
  placeholder:data.num_interior,
  label:'numero interior',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese num_interior'
},
{
  name:'pais',
  required:true,
  placeholder:data.pais,
  label:'pais',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese pais'
},
{
  name:'razon_social',
  required:true,
  placeholder:data.razon_social,
  label:'razon social',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese razon_social'
},
{
  name:'regimen fiscal',
  required:true,
  placeholder:data.regimen_fiscal,
  label:'regimen_fiscal',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese regimen_fiscal'
},
{
  name:'rfc',
  required:true,
  placeholder:data.rfc,
  label:'rfc',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese rfc'
},
{
  name:'tipo de paquete',
  required:true,
  placeholder:data.tipo_servicio_paquete,
  label:'tipo_servicio_paquete',
  type:'text',
  defaultValue:'',
  size:'half',
  errorMessageEmpty:'Ingrese tipo_servicio_paquete'
},
    ]
    const handleOnchange = useCallback( (e) => {
      console.log(e.target.value)
      return e.target.value
     })

  return (
    <div className={s.container}>
      <h5 className={s.h5}>Actualizar Usuario</h5>
      <form action="" className={s.form}>
        {
            userInformation.map((item,key)=>(
                <Input key={key} value={item.value} required={item.required} name={item.name} placeHolder={item.placeholder} type={item.type} label={item.label} size={item.size} handleOnchange={handleOnchange}/>
            ))
        }
      </form>
    </div>
      )
}
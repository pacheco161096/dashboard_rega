import { FC } from "react"

import {  PencilIcon } from '@primer/octicons-react'

import s from './Table.module.css'

interface TableProps {
  data:[itemProps]
  handleUpdateCliente:() => itemProps
} 

export interface itemProps {
  id:string
  nombre:string
  email:string
  celular:string
  localidad:string
  tipo_servicio_paquete:string
  estatus_servicio:boolean
}

export const Table:FC<TableProps> = (props) => {
  const {data,handleUpdateCliente} = props
  return (
    <div className={s.container}>
      <div className={s.contenTable}>
        <table className={s.table}>
          <thead className={s.thead}>
            <tr>
              <td className="px-4 py-3 font-bold">No. Contrato</td>
              <td className="px-4 py-3 font-bold">Nombre</td>
              <td className="px-4 py-3 font-bold">Correo</td>
              <td className="px-4 py-3 font-bold">Telefono</td>
              <td className="px-4 py-3 font-bold">Localidad</td>
              <td className="px-4 py-3 font-bold">Tipo de servicio</td>
              <td className="px-4 py-3 font-bold">Status</td>
              <td className="px-4 py-3 font-bold">Editar</td>
            </tr>
          </thead>
          <tbody className={s.tbody}>
            {
              data?.map( (item,i) => (
              <tr key={i}>
                <td className={s.td}>
                  <span className={s.span}>{item.id}</span>
                </td>
                <td className={s.td}>
                  <span className={s.span}>{ item.nombre }</span>
                </td>
                <td className={s.td}>
                  <span className={s.span}>{ item.email }</span>
                </td>
                <td className={s.td}>
                  <span className={s.span}>{ item.celular }</span>
                </td>
                <td className={s.td}>
                  <span className={s.span}>{ item.localidad }</span>
                </td>
                <td className={s.td}>
                 <span className={s.span}> { item.tipo_servicio_paquete } </span>
                </td>
                <td className={s.td}>
                  <span className={ `inline-flex px-2 text-xs font-medium leading-5 rounded-full  ${ item.estatus_servicio === true ? 'text-green-700  bg-green-100' : 'text-red-100 bg-red-700'}` }> { item.estatus_servicio == true ? "Activo" : "Suspendido" } </span>
                </td>
                <td className={s.td}>
                  <span onClick={() => handleUpdateCliente(item)} className={s.btnEdit}> <PencilIcon size={24} fill="#ffffff" /> </span>
                </td>
            </tr>
              ) )
            }
          </tbody>
        </table>
      </div>
      <div className="flex flex-col justify-between text-xs sm:flex-row text-gray-600 mt-3">
        <span className="flex items-center font-semibold tracking-wide">
          Usuarios 1 - 8 de 50
        </span>
        <div className="flex mt-2 sm:mt-auto sm:justify-end">
          <nav>
            <ul className="inline-flex items-center">
              <li>
                <button className="align-bottom inline-flex items-center justify-center cursor-pointer leading-5 transition-colors duration-150 font-medium focus:outline-none px-3 py-1 rounded-md text-xs text-white bg-blue-600 border border-transparent active:bg-blue-600 hover:bg-blue-500 focus:shadow-outline-purple">1</button>
              </li>
              <li>
                <button className="align-bottom inline-flex items-center justify-center cursor-pointer leading-5 transition-colors duration-150 font-medium focus:outline-none px-3 py-1 rounded-md text-xs text-gray-600 focus:outline-none border border-transparent active:bg-transparent hover:bg-gray-100 focus:shadow-outline-gray">2</button>
              </li>
              <li>
                <button className="align-bottom inline-flex items-center justify-center cursor-pointer leading-5 transition-colors duration-150 font-medium focus:outline-none px-3 py-1 rounded-md text-xs text-gray-600 focus:outline-none border border-transparent active:bg-transparent hover:bg-gray-100 focus:shadow-outline-gray">3</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
      )
}
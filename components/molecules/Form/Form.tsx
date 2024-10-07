import {FC} from 'react'
import { Input, InputProps } from '@/components/atoms/Input/Input'

import s from './Form.module.css'

export interface FormProps {
 dataInput:InputProps
 handleSubmit: () => void
}

export const Form:FC<FormProps> = (props) => {

  const {dataInput,handleSubmit} = props

  return (
    <form action="" className={s.form} onSubmit={handleSubmit}>
    <h2 className=" text-3xl mb-5 text-center">Informacion de usuario</h2>
    <div className=" grid grid-cols-2 gap-4 w-full">
    {
        dataInput?.map( (item,i) => (
            <Input
            key={i}
            name={item.name} 
            requerid={item.requerid}
            placeHolder={item.placeHolder}
            type={item.type}
            value={item.name} 
            label={item.label}
            />
        ) )
       }
    </div>
    <input type="submit" value="Guardar" className=" rounded-md bg-blue-600 text-white p-2 w-48 mt-5" />
  </form>
  )
}
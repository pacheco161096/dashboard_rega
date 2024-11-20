import {FC} from 'react'

export interface InputProps {
    key:number
    name:string
    required:boolean,
    placeHolder:string,
    type:string
    value?:string
    label?:string
    defaultValue?:string
    size:string
    errorMessageEmpty?:string
}

export const Input:FC<InputProps> = (props) => {

    const {name,required,placeHolder,type,value,label} = props

    const handleOnchange = (e) => {
       return e.target.value
      }

  return (
    <div className="inputContainer relative">
    <input type={type} 
      className="peer h-12 w-full rounded-lg  ring-1 px-2 ring-gray-300 focus:ring-blue-600 focus:outline-none focus:border-blue-600" 
      name={name}
      placeholder={ placeHolder }
      required={required}
      value={value}
      onChange={handleOnchange}
      />
      <label htmlFor={label} className="absolute cursor-text left-0 -top-3 text-sm text-gray-400 mx-1 px-1 peer-placeholder-shown:-z-10 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#6f6d74] peer-placeholder-shown:top-3 peer-focus:z-10 peer-focus:-top-3 bg-[#ffffff]">{label}</label>
  </div>
  )
}


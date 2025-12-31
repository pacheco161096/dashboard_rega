'use client'


import {FC} from 'react'

export interface SearchBoxProps {
 handleFilter: (id:string) => void
}

export const SearchBox:FC<SearchBoxProps> = (props) => {
  const {handleFilter} = props

  const handleOnchange = (event:React.ChangeEvent<HTMLInputElement>) => {
    handleFilter(event.target.value)
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <i className="fa-solid fa-magnifying-glass text-sm"></i>
      </div>
      <input 
        onChange={handleOnchange} 
        placeholder="Buscar por ID, nombre o correo..." 
        type="text" 
        className="block w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 bg-white transition-all duration-200" 
      />
    </div>
  )
}

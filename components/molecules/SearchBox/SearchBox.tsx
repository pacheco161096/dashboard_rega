'use client'


import {FC} from 'react'

export interface SearchBoxProps {
 handleFilter: (id:string) => void
}

export const SearchBox:FC<SearchBoxProps> = (props) => {
  const {handleFilter} = props

  const handleOnchange = (event) => {
    handleFilter(event.target.value)
  }

  return (
    <>
    <div className="relative w-full max-w-xl mr-6 focus-within:text-blue-600 flex justify-center items-center border border-gray-400 p-3">
      <input onChange={handleOnchange} placeholder="Buscar Cliente" type="text" className="block w-full text-sm focus:outline-none  form-input leading-5 focus-within:text-blue-600  focus:shadow-outline-purple  text-gray-700" />
    </div> 
    </>
  )
}

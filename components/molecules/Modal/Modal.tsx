import { FC, ReactNode} from "react"

import s from './Modal.module.css'

import {XIcon } from '@primer/octicons-react'
import { Button } from "@/components/atoms/Button/Button"

export interface ModalProps {
  children:ReactNode
  handleModal: () => void
}

export const Modal:FC<ModalProps> = (props) => {

  const {children,handleModal} = props

  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.headerModal}> <Button onClick={handleModal} variant="secondary"> <XIcon size={30}/> </Button></div>
        <div className="mb-6 text-sm text-gray-700">
          { children }
        </div>
      </div>
     
  </div>
  )
}


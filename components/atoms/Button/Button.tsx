import { FC, ReactNode} from "react"

import cn from 'clsx'

import s from './Button.module.css'

export type Variant = 'primary' | 'secondary' | 'danger' | 'warning'

export type Size = 'base' | 'md' | 'lg' | 'xl'

export interface ModalProps {
    children:ReactNode
    variant?:Variant
    size?: Size
    className?:string
    fullWidth?:boolean
    onClick: () => void
  }

export const Button:FC<ModalProps> = (props) => {

    const { variant='primary',size='base',className,children,fullWidth,onClick} = props

    const rootClassName = cn(
        s.root,
        {
          [s.primary]: variant === 'primary',
          [s.secondary]: variant === 'secondary',
          [s.sizebase]: size === 'base',
          [s.sizemd]: size === 'md',
          [s.sizelg]: size === 'lg',
          [s.sizexl]: size === 'xl',
          [s.fullWidth]:fullWidth,
        },
        className
      )
  return (
    <button className={rootClassName} onClick={onClick}>
        {children}
    </button>
  )
}

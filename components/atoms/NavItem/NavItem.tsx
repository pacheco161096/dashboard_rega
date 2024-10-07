import Link from "next/link"
import s from './NavItem.module.css'
import { FC, ReactNode } from "react"

export interface NavItemProps {
  href:string
  tooltip?:string
  className?:string
  children:ReactNode
}

export const NavItem:FC<NavItemProps> = (props) => {

  const {href,children} = props

  return (
      <Link href={href} className={s.link}>
        {children}
      </Link>
  )
}
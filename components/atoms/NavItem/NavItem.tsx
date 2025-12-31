import Link from "next/link"
import s from './NavItem.module.css'
import { FC, ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface NavItemProps {
  href:string
  tooltip?:string
  className?:string
  children:ReactNode
  isActive?:boolean
  onClick?: () => void
}

export const NavItem:FC<NavItemProps> = (props) => {

  const {href, children, isActive = false, onClick} = props

  return (
      <Link 
        href={href} 
        className={cn(s.link, isActive && s.linkActive)}
        title={props.tooltip}
        onClick={onClick}
      >
        {children}
      </Link>
  )
}
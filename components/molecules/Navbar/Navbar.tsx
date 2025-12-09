'use client'
import { NavItem } from '@/components/atoms/NavItem/NavItem'
import s from './Navbar.module.css'
import { HomeIcon,PeopleIcon,PackageIcon,CreditCardIcon   } from '@primer/octicons-react'
import { usePathname } from "next/navigation";
import { ChartBarIcon } from 'lucide-react';

export const Navbar = () => {
  const nameLinks = [{
    name:'Home',
    href:'/dashboard',
    tooltip:'Home',
    icon:<HomeIcon size={20}/>
  },
  {
    name:'Clientes',
    href:'/dashboard/customers',
    tooltip:'Clientes',
    icon:<PeopleIcon size={20}/>
  },
  {
    name:'Almacen',
    href:'/dashboard/almacen',
    tooltip:'Almacen',
    icon:<PackageIcon  size={20}/>
  },
  {
    name:'Cobranza',
    href:'/dashboard/cobranza',
    tooltip:'Cobranza', 
    icon:<CreditCardIcon  size={20}/>
  },
  {
    name:'Reportes',
    href:'/dashboard/reportes',
    tooltip:'Reportes', 
    icon:<ChartBarIcon  size={20}/>
  },
  ]
  const pathname = usePathname();

  return (
    <>
      <aside className={s.asideDesktop}>
        <nav className={s.nav}>
          <div className='font-bold'>REGATELECOM</div>
          {
            nameLinks && nameLinks.map((item)=>{
              return (<NavItem
                key={item.name}
                href={item.href}
                tooltip={item.tooltip}          
              >
                <span>{item.icon && item.icon}</span><span className={`text-base ${item.href !== `.${pathname}` ? 'text-gray-900' : 'text-white font-bold'}`}>{item.name}</span>
              </NavItem>
            )})
          }
          </nav>
      </aside>
  </>
  )
}

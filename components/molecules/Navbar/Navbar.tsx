import { NavItem } from '@/components'
import s from './Navbar.module.css'
import { HomeIcon,PeopleIcon,PackageIcon,CreditCardIcon   } from '@primer/octicons-react'

export const Navbar = () => {
  const nameLinks = [{
    name:'Home',
    href:'./',
    tooltip:'Home',
    icon:<HomeIcon size={28}/>
  },
  {
    name:'Clientes',
    href:'./customers',
    tooltip:'Clientes',
    icon:<PeopleIcon size={30}/>
  },
  {
    name:'Almacen',
    href:'./almacen',
    tooltip:'Almacen',
    icon:<PackageIcon  size={30}/>
  },
  {
    name:'Cobranza',
    href:'./cobranza',
    tooltip:'Cobranza', 
    icon:<CreditCardIcon  size={30}/>
  }
]
  return (
    <>
      <aside className={s.asideDesktop}>
        <nav className={s.nav}>
          {
            nameLinks && nameLinks.map((item)=>(
              <NavItem
                key={item.name}
                href={item.href}
                tooltip={item.tooltip}              
              >
                {item.icon && item.icon}<span className={s.nameLink}>{item.name}</span>
              </NavItem>
            ))
          }
          </nav>
      </aside>
  </>
  )
}

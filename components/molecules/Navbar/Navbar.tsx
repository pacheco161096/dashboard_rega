'use client'
import { useState } from 'react'
import { NavItem } from '@/components/atoms/NavItem/NavItem'
import s from './Navbar.module.css'
import { HomeIcon, PeopleIcon, PackageIcon, CreditCardIcon } from '@primer/octicons-react'
import { usePathname } from "next/navigation";
import { ChartBarIcon } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const nameLinks = [
    {
      name:'Inicio',
      href:'/dashboard',
      tooltip:'Inicio',
      icon:<HomeIcon size={20}/>
    },
    {
      name:'Clientes',
      href:'/dashboard/customers',
      tooltip:'Clientes',
      icon:<PeopleIcon size={20}/>
    },
    // {
    //   name:'Almacen',
    //   href:'/dashboard/almacen',
    //   tooltip:'Almacen',
    //   icon:<PackageIcon size={20}/>
    // },
    {
      name:'Cobranza',
      href:'/dashboard/cobranza',
      tooltip:'Cobranza', 
      icon:<CreditCardIcon size={20}/>
    },
    {
      name:'Reportes',
      href:'/dashboard/reportes',
      tooltip:'Reportes', 
      icon:<ChartBarIcon  size={20}/>
    },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Menu */}
      <aside className={s.asideDesktop}>
        <nav className={s.nav}>
          <div className={s.brand}>
            <span className={s.brandText}>REGATELECOM</span>
          </div>
          <div className={s.menuItems}>
            {
              nameLinks && nameLinks.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
                return (
                  <NavItem
                    key={item.name}
                    href={item.href}
                    tooltip={item.tooltip}
                    isActive={isActive}
                    onClick={closeMobileMenu}
                  >
                    <span className={s.iconWrapper}>
                      {item.icon && item.icon}
                    </span>
                    <span className={s.label}>{item.name}</span>
                  </NavItem>
                )
              })
            }
          </div>
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button 
        className={s.mobileMenuButton}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={s.mobileOverlay} onClick={closeMobileMenu}></div>
      )}

      {/* Mobile Menu Sidebar */}
      <aside className={`${s.mobileMenu} ${isMobileMenuOpen ? s.mobileMenuOpen : ''}`}>
        <nav className={s.nav}>
          <div className={s.brand}>
            <span className={s.brandText}>REGATELECOM</span>
            <button 
              onClick={closeMobileMenu}
              className={s.closeButton}
              aria-label="Close menu"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
          <div className={s.menuItems}>
            {
              nameLinks && nameLinks.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
                return (
                  <NavItem
                    key={item.name}
                    href={item.href}
                    tooltip={item.tooltip}
                    isActive={isActive}
                    onClick={closeMobileMenu}
                  >
                    <span className={s.iconWrapper}>
                      {item.icon && item.icon}
                    </span>
                    <span className={s.label}>{item.name}</span>
                  </NavItem>
                )
              })
            }
          </div>
        </nav>
      </aside>
    </>
  )
}

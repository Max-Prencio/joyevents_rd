import { useState, useEffect } from 'react'
import { X, Menu } from 'lucide-react'

const links = [
  { href: '#about',     label: 'Nosotros' },
  { href: '#services',  label: 'Servicios' },
  { href: '#portfolio', label: 'Portafolio' },
  { href: '#equipo',    label: 'Equipo' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const close = () => setOpen(false)

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div className="container">
        <a href="#" className="nav-logo" onClick={close}>
          <img src="/logo-nav.svg" className="nav-logo-img" alt="Joy Events" />
        </a>

        {/* Desktop links */}
        <ul className="nav-links">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
          <li>
            <a href="#agenda" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '12px' }}>
              Agendar Llamada
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="nav-toggle"
          onClick={() => setOpen(o => !o)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>

        {/* Mobile menu — separate class, never shown on desktop */}
        <div className={`nav-mobile-menu ${open ? 'open' : ''}`}>
          <button className="nav-close-btn" onClick={close} aria-label="Cerrar menú">
            <X size={28} />
          </button>
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
          ))}
          <a href="#agenda" className="btn btn-primary" onClick={close} style={{ marginTop: 8 }}>
            Agendar Llamada
          </a>
        </div>
      </div>
    </nav>
  )
}

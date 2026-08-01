import { WHATSAPP_NUMBER } from '../config'

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <a href="#" className="footer-logo">Joy <span>Events</span></a>
        <p className="footer-tagline">Creando momentos que duran para siempre</p>

        <div className="footer-social">
          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          {/* Facebook */}
          <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          {/* WhatsApp */}
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" title="WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </a>
        </div>

        <div className="footer-links">
          {[
            { href: '#about',     label: 'Nosotros' },
            { href: '#services',  label: 'Servicios' },
            { href: '#portfolio', label: 'Portafolio' },
            { href: '#equipo',    label: 'Equipo' },
            { href: '#agenda',    label: 'Agendar' },
          ].map(l => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>

        <div className="footer-divider" />
        <p className="footer-copy">© {new Date().getFullYear()} Joy Events RD. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

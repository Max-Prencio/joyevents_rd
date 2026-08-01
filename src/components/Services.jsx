import { Crown, Gem, HeartHandshake, Cake, Baby, Users, Briefcase, Armchair } from 'lucide-react'
import { useEffect, useRef } from 'react'

const services = [
  {
    icon: <Crown size={24} />,
    title: 'Wedding Planner',
    desc: 'Planificación y coordinación completa de tu boda: desde el concepto hasta el último detalle del día. Diseño, catering, asistencia personalizada, jugos y postres incluidos.',
    featured: true,
    tags: ['Planificación', 'Coordinación', 'Catering', 'Diseño', 'Asistencia personalizada'],
  },
  { icon: <Gem size={24} />,           title: 'Bodas',                    desc: 'Desde rústicas hasta clásicas, hemos trabajado más de 25 bodas conceptuales con innovación, presencia y profesionalismo.' },
  { icon: <HeartHandshake size={24} />, title: 'Propuestas de Matrimonio', desc: 'Creamos el escenario perfecto para ese momento único. Cada propuesta diseñada para sorprender y emocionar.' },
  { icon: <Cake size={24} />,          title: 'Cumpleaños',               desc: 'Celebraciones de cumpleaños con decoración temática y montajes personalizados para todas las edades.' },
  { icon: <Baby size={24} />,          title: 'Baby Shower & Gender Reveal', desc: 'Celebra la llegada de tu bebé con una decoración mágica y llena de emoción.' },
  { icon: <Users size={24} />,         title: 'Eventos Sociales',         desc: 'Graduaciones, cenas familiares y más. Más de 100 eventos sociales coordinados con el sello Joy Events.' },
  { icon: <Briefcase size={24} />,     title: 'Eventos Corporativos',     desc: 'Cenas corporativas y eventos empresariales con el nivel de profesionalismo que tu empresa merece.' },
  { icon: <Armchair size={24} />,      title: 'Alquileres & Decoraciones', desc: 'Contamos con una cartera de 30+ clientes fijos para alquiler y decoración de eventos formales e informales.' },
]

export default function Services() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.fade-up') ?? []
    const obs = new IntersectionObserver(entries =>
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="services" style={{ background: '#fff' }} ref={ref}>
      <div className="container">
        <div className="fade-up" style={{ marginBottom: 0 }}>
          <span className="tag">Qué Ofrecemos</span>
          <h2 className="section-title">Nuestros Servicios</h2>
          <p className="section-sub">
            Desde la conceptualización hasta la ejecución, te acompañamos en cada paso para hacer de tu evento algo extraordinario.
          </p>
        </div>
        <div className="services-grid">
          {services.map(s => (
            <div key={s.title} className={`service-card fade-up${s.featured ? ' featured' : ''}`}>
              <div className="service-icon">{s.icon}</div>
              <div className={s.featured ? 'service-content' : ''}>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {s.tags && (
                  <div className="service-features">
                    {s.tags.map(t => <span key={t} className="service-feature-tag">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

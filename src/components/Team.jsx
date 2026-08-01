import { Flower2, Hammer, Sparkles, CalendarCheck, ClipboardList, Camera } from 'lucide-react'
import { useEffect, useRef } from 'react'

const members = [
  { initial: 'R', name: 'Rossy',   role: 'Decoradora & Montaje',    icon: <Flower2 size={28} />,       desc: 'Especialista en diseño floral y decoración de espacios. Transforma cualquier lugar en un escenario mágico.' },
  { initial: 'A', name: 'Alexis',  role: 'Asistente de Montaje',    icon: <Hammer size={28} />,        desc: 'Apoya en cada fase del montaje para garantizar que cada detalle quede impecable el día del evento.' },
  { initial: 'J', name: 'Joy',     role: 'La Inspiración',          icon: <Sparkles size={28} />,      desc: 'Su nombre es nuestra marca. Su alegría y esencia inspiran cada evento que creamos.' },
  { initial: 'R', name: 'Rocío',   role: 'Wedding Planner',         icon: <CalendarCheck size={28} />, desc: 'La mente organizadora de cada evento. Logística, planificación y coordinación perfecta.' },
  { initial: 'E', name: 'Edelyn',  role: 'Asistente de Logística',  icon: <ClipboardList size={28} />, desc: 'Asegura que cada pieza encaje a la perfección. Coordinación y apoyo logístico en cada evento.' },
  { initial: 'E', name: 'Eleazar', role: 'Multimedia',              icon: <Camera size={28} />,        desc: 'Fotógrafo y videógrafo profesional. Captura cada emoción para que la revivas una y otra vez.' },
]

export default function Team() {
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
    <section id="equipo" style={{ background: 'var(--gray-light)' }} ref={ref}>
      <div className="container">
        <div className="team-header fade-up" style={{ textAlign: 'center', marginBottom: 0 }}>
          <span className="tag">Las Personas Detrás de la Magia</span>
          <h2 className="section-title">Conoce Nuestro Equipo</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Un equipo apasionado, talentoso y comprometido con hacer de tu evento algo verdaderamente especial.
          </p>
        </div>
        <div className="team-grid">
          {members.map(m => (
            <div key={m.name} className="team-card fade-up">
              <div className="team-card-inner">
                <div className="team-card-front">
                  <div className="team-avatar">
                    <span className="initial-letter">{m.initial}</span>
                  </div>
                  <h4>{m.name}</h4>
                  <div className="team-role">{m.role}</div>
                </div>
                <div className="team-card-back">
                  <div className="back-icon">{m.icon}</div>
                  <h4>{m.name}</h4>
                  <div className="back-role">{m.role}</div>
                  <p>{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

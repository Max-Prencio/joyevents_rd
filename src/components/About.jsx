import { useEffect, useRef } from 'react'

export default function About() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.fade-up') ?? []
    const obs = new IntersectionObserver(entries =>
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="about" id="about" ref={ref} style={{ background: 'var(--off-white)' }}>
      <div className="container">
        <div className="about-grid">
          <div className="about-image-wrap fade-up">
            <img
              className="about-image-main"
              src="https://images.pixieset.com/56159669/3ddb088f2f8d43164c58b1c78ee847ae-cover.jpg"
              alt="Joy Events"
              loading="lazy"
            />
            <div className="about-image-badge">
              <div className="num">50+</div>
              <div className="label">Eventos Realizados</div>
            </div>
          </div>

          <div className="about-text fade-up">
            <span className="tag">Nuestra Historia</span>
            <h2 className="section-title">De alquileres a experiencias inolvidables</h2>
            <p>
              Joy Events RD no inició como lo que hoy es. Todo comenzó como un negocio de{' '}
              <strong>alquiler de sillas y mesas</strong>, que con el tiempo creció hacia Joy
              Alquileres y Decoraciones. La búsqueda de nuevas oportunidades y el deseo de
              suplir los sueños de cada cliente nos llevó a dar el gran salto.
            </p>
            <p>
              Hoy somos <strong>Joy Events RD</strong>: una empresa especializada en bodas,
              propuestas de matrimonio y eventos sociales, con más de 10 años de trayectoria y
              6 años dedicados a la decoración y montaje de eventos.
            </p>
            <div className="about-stats">
              {[
                { num: '25+', label: 'Bodas conceptuales' },
                { num: '100+', label: 'Eventos sociales' },
                { num: '30+', label: 'Clientes fijos' },
              ].map(s => (
                <div className="about-stat" key={s.label}>
                  <div className="num">{s.num}</div>
                  <div className="label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

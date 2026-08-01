import { useEffect, useRef } from 'react'

export default function Founder() {
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
    <section className="founder-section" ref={ref}>
      <div className="container">
        <div className="founder-grid">
          <div className="founder-image fade-up">
            <img
              src="/images/WhatsApp Image 2026-07-10 at 8.17.33 PM.jpeg"
              alt="Fundadora de Joy Events"
              style={{ objectPosition: 'center 20%' }}
            />
            <div className="founder-badge">Fundadora</div>
          </div>
          <div className="founder-text fade-up">
            <span className="tag">La Visionaria</span>
            <h2 className="section-title" style={{ color: '#fff' }}>
              La Mente y el Corazón detrás de Joy Events
            </h2>
            <div className="founder-title">Fundadora & Directora General</div>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, marginBottom: 16 }}>
              Todo comenzó con un sueño y el amor de una madre. La fundadora de Joy Events no solo creó una empresa
              de eventos — creó un legado familiar. Con una visión clara de lo que significa hacer feliz a las
              personas en los momentos más importantes de su vida, construyó desde cero una marca que hoy es
              sinónimo de elegancia, emoción y excelencia.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, marginBottom: 16 }}>
              Su dedicación, creatividad y pasión por los detalles son el alma de cada evento que realizamos.
              Ella es quien inspira a todo el equipo a dar siempre lo mejor, recordándoles que detrás de cada
              evento hay una historia de amor que merece ser perfecta.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9 }}>
              Madre de las administradoras de Joy Events, transmitió a sus hijas no solo una profesión, sino una
              misión: crear momentos que las personas recuerden para siempre.
            </p>
            <div className="founder-values">
              {['Visión', 'Dedicación', 'Creatividad', 'Amor por los detalles'].map(v => (
                <span key={v} className="founder-value">{v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

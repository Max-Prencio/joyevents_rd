import { useEffect, useRef } from 'react'

const testimonials = [
  {
    text: 'Hoy quiero tomar un momento para expresar mi más sincero agradecimiento a mi querida Wendy Planner. Desde el primer día has puesto amor, dedicación, paciencia y profesionalismo en cada detalle de nuestro gran día. Gracias por escuchar nuestras ideas, orientarnos y hacer que este proceso sea mucho más especial y tranquilo. Tu compromiso y pasión por lo que haces se reflejan en cada paso, y eso lo valoramos muchísimo. También quiero agradecer de todo corazón al maravilloso equipo de Joy Events por el esfuerzo, la creatividad y el cariño con el que están preparando cada detalle de nuestra boda.',
    name: 'Cliente Joy Events',
  },
  {
    text: 'Quiero darte las gracias por haber sido parte del sueño más grande de mi vida. Por más que proveedora, ser mi amiga siempre, por estar pendiente que todo estuviera perfecto. Está demás decirte que te amo con todo mi corazón. Oro para que estés bien, para que Dios sea contigo y por ti, te ayude a resolver lo que no puedes resolver sola y prospere tu vida amiga linda. De verdad muchas gracias por todo.',
    name: 'Novia Joy Events',
  },
  {
    text: 'Rosangela, de verdad mil gracias por su hermoso servicio. De verdad que ustedes son lo máximo. Gloria a Dios por Joy Events y que el Señor los bendiga por la eternidad. De verdad gracias. Todo estuvo HERMOSO, MEJOR DE LO QUE NUNCA IMAGINÉ.',
    name: 'Cliente Joy Events',
  },
  {
    text: 'Tenemos que agradecerte por todo ese trabajo. Eres excelente en lo que haces, al junto de tu equipo. Esa decoración ha dado mucho de qué hablar, todo el mundo está maravillado. Resaltamos tu trabajo y talento por siempre estar abierta a nuestras sugerencias y peticiones. Eres excelente en lo que haces. El esfuerzo de que todo quedara bien y de que esto sea un evento inolvidable — gracias.',
    name: 'Clientes Joy Events',
  },
]

function TCard({ text, name }) {
  return (
    <div className="tcard">
      <div className="tcard-seal">J</div>
      <div className="tcard-body">
        <div className="tcard-ornament">— ✦ —</div>
        <blockquote>{text}</blockquote>
        <div className="tcard-divider" />
        <div className="tcard-stars">★ ★ ★ ★ ★</div>
        <div className="tcard-name">{name}</div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.fade-up') ?? []
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const doubled = [...testimonials, ...testimonials]
  return (
    <section className="testimonials-section" ref={ref}>
      <div className="testimonials-header fade-up">
        <span className="tag">Lo Que Dicen Nuestros Clientes</span>
        <h2>Palabras que nos llenan el corazón</h2>
      </div>
      <div className="testimonials-track-wrap">
        <div className="testimonials-track">
          {doubled.map((t, i) => <TCard key={i} {...t} />)}
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'

const slides = [
  'https://images.pixieset.com/676945401/1f41b9a9fa9fdcaf520a4be8f13c5310-cover.jpg',
  'https://images.pixieset.com/67964079/37fbbb3c6dc2ff07d68877370e3e0cd5-cover.JPG',
  'https://images.pixieset.com/56159669/3ddb088f2f8d43164c58b1c78ee847ae-cover.jpg',
  'https://images.pixieset.com/54390439/0619163de4fd6ebe7b9fccec3da957cc-cover.JPG',
  'https://images.pixieset.com/676945401/bd330166d1f89637fcd9b2c3557dd26e-large.jpg',
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero" id="hero">
      {slides.map((src, i) => (
        <div
          key={src}
          className={`hero-slide ${i === current ? 'active' : ''}`}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}
      <div className="hero-bg" />

      <div className="container hero-content">
        <span className="hero-eyebrow">✦ Especialistas en Eventos</span>
        <div>
          <img src="/logo-hero.svg" alt="Joy Events" className="hero-logo-img" />
        </div>
        <p className="hero-subtitle">
          Hacemos de tu boda o petición de mano una experiencia que vivirás para siempre.
          Cada detalle, cada emoción, cuidado por nosotros.
        </p>
        <div className="hero-btns">
          <a href="#agenda" className="btn btn-primary">Agendar Llamada</a>
          <a href="#portfolio" className="btn btn-white">Ver Portafolio</a>
        </div>
      </div>

      <a href="#about" className="hero-scroll">
        <span>Descubre</span>
        <div className="scroll-line" />
      </a>
    </section>
  )
}

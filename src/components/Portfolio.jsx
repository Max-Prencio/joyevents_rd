import { useState, useEffect, useRef } from 'react'

const items = [
  // Propuestas
  { src: 'https://images.pixieset.com/676945401/1f41b9a9fa9fdcaf520a4be8f13c5310-cover.jpg', cat: 'propuesta', wide: true,  type: 'Propuesta de Mano', caption: 'J&C — Un momento mágico' },
  { src: 'https://images.pixieset.com/676945401/251c17f39894a72c4e1cc1530e9c85c1-large.jpg',  cat: 'propuesta', wide: false, type: 'Propuesta de Mano', caption: 'Decoración especial' },
  { src: 'https://images.pixieset.com/676945401/7585ba2b13d9d17f62515e02490abfca-large.jpg',  cat: 'propuesta', wide: false, type: 'Propuesta de Mano', caption: 'Detalles florales' },
  { src: 'https://images.pixieset.com/676945401/460e50e3761c29d766e53a4550379b65-large.jpg',  cat: 'propuesta', wide: false, type: 'Propuesta de Mano', caption: 'El momento del sí' },
  { src: 'https://images.pixieset.com/676945401/5c530b6cc8378aac15e29520ece0c3c2-large.jpg',  cat: 'propuesta', wide: false, type: 'Propuesta de Mano', caption: 'Ambiente romántico' },
  { src: 'https://images.pixieset.com/676945401/cd432f0fe4af677de4ccc26d016dc6a7-large.jpg',  cat: 'propuesta', wide: false, type: 'Propuesta de Mano', caption: 'Decoración de ensueño' },
  { src: 'https://images.pixieset.com/676945401/bd330166d1f89637fcd9b2c3557dd26e-large.jpg',  cat: 'propuesta', wide: true,  type: 'Propuesta de Mano', caption: 'La sorpresa perfecta' },
  // Post Boda
  { src: 'https://images.pixieset.com/56159669/3ddb088f2f8d43164c58b1c78ee847ae-cover.jpg',   cat: 'postboda',  wide: true,  type: 'Post Boda', caption: 'Sesión de ensueño' },
  { src: 'https://images.pixieset.com/56159669/27fdc03d5b83e29819016b47730e948a-large.JPG',   cat: 'postboda',  wide: false, type: 'Post Boda', caption: 'Para siempre' },
  // Bodas — Raymer & Arihanna (preparación)
  { src: '/images/wedding/getting-ready/getting-ready-01-vestido-colgado.webp',    cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Todo listo para el gran día', alt: 'Vestido de novia colgado junto a los zapatos y el velo' },
  { src: '/images/wedding/getting-ready/getting-ready-02-preparacion-madre.webp',  cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Risas antes del gran momento', alt: 'Familiar de la novia riendo durante los últimos retoques de maquillaje' },
  { src: '/images/wedding/getting-ready/getting-ready-03-peinado-rizos.webp',      cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Cada rizo en su lugar', alt: 'Primer plano de una dama de honor recibiendo su peinado con rizos' },
  { src: '/images/wedding/getting-ready/getting-ready-04-damas-novia.webp',        cat: 'boda', wide: true,  type: 'Preparación de la Novia', caption: 'Rodeada de las suyas', alt: 'Damas de honor rodeando a la novia con cariño antes de la ceremonia' },
  { src: '/images/wedding/getting-ready/getting-ready-05-collar-detalle.webp',     cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Elegancia en cada detalle', alt: 'Primer plano del collar de la novia' },
  { src: '/images/wedding/getting-ready/getting-ready-06-perfil-velo.webp',        cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Un momento a solas', alt: 'Perfil de la novia con el velo puesto junto a una ventana iluminada' },
  { src: '/images/wedding/getting-ready/getting-ready-07-novio-reloj.webp',        cat: 'boda', wide: false, type: 'Preparación del Novio', caption: 'Los últimos detalles', alt: 'Novio ajustándose el reloj antes de la ceremonia' },
  { src: '/images/wedding/getting-ready/getting-ready-08-padrinos-fila.webp',      cat: 'boda', wide: false, type: 'Preparación del Novio', caption: 'El novio y sus padrinos', alt: 'Novio junto a sus padrinos de boda en fila antes de la ceremonia' },
  { src: '/images/wedding/getting-ready/getting-ready-09-novio-relajado.webp',     cat: 'boda', wide: false, type: 'Preparación del Novio', caption: 'Calma antes del sí', alt: 'Novio relajado hablando por teléfono antes de la boda' },
  { src: '/images/wedding/getting-ready/getting-ready-10-novia-caminando.webp',    cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Camino a la ceremonia', alt: 'Novia sonriente caminando por el balcón hacia la ceremonia' },
  // Bodas — Raymer & Arihanna (ceremonia)
  { src: '/images/wedding/ceremony/ceremony-01-nina-flores.webp',         cat: 'boda', wide: false, type: 'Ceremonia', caption: 'La niña de las flores', alt: 'Niña de las flores caminando con su canasta antes de la ceremonia' },
  { src: '/images/wedding/ceremony/ceremony-02-invitada-emocionada.webp', cat: 'boda', wide: true,  type: 'Ceremonia', caption: 'Emociones a flor de piel', alt: 'Invitada emocionada hasta las lágrimas durante la ceremonia' },
  { src: '/images/wedding/ceremony/ceremony-03-caminando-altar.webp',     cat: 'boda', wide: false, type: 'Ceremonia', caption: 'Raymer & Arihanna — El gran día', alt: 'Novia caminando del brazo de su padre hacia el altar' },
  { src: '/images/wedding/ceremony/ceremony-04-oficiante.webp',           cat: 'boda', wide: true,  type: 'Ceremonia', caption: 'Las palabras que los unieron', alt: 'El oficiante dirigiendo la ceremonia de boda' },
  { src: '/images/wedding/ceremony/ceremony-05-novio-ternura.webp',       cat: 'boda', wide: true,  type: 'Ceremonia', caption: 'Con los ojos llenos de amor', alt: 'El novio observando con ternura a su prometida durante la ceremonia' },
  { src: '/images/wedding/ceremony/ceremony-06-anillos-manos.webp',       cat: 'boda', wide: false, type: 'Ceremonia', caption: 'El intercambio de anillos', alt: 'Manos entrelazadas de los novios mostrando los anillos de boda' },
  { src: '/images/wedding/ceremony/ceremony-07-novios-tomados-mano.webp', cat: 'boda', wide: false, type: 'Ceremonia', caption: 'Radiantes de felicidad', alt: 'Los novios tomados de la mano, sonriendo frente al altar' },
  { src: '/images/wedding/ceremony/ceremony-08-primer-beso.webp',         cat: 'boda', wide: false, type: 'Ceremonia', caption: 'El primer beso', alt: 'Los novios compartiendo su primer beso como esposos bajo el altar' },
  { src: '/images/wedding/ceremony/ceremony-09-salida-jubilosa.webp',     cat: 'boda', wide: false, type: 'Ceremonia', caption: 'Ya son marido y mujer', alt: 'Los novios saliendo entre aplausos y celebración de los invitados' },
  { src: '/images/wedding/ceremony/ceremony-10-foto-grupal.webp',         cat: 'boda', wide: true,  type: 'Ceremonia', caption: 'La familia al completo', alt: 'Foto grupal de los novios junto a todo el cortejo nupcial' },
  // Bodas — Raymer & Arihanna (recepción / noche)
  { src: '/images/wedding/night/night-01-mesa-principal.webp',    cat: 'boda', wide: false, type: 'Recepción', caption: 'En la mesa principal', alt: 'Los novios en su mesa principal con lentes de sol de corazón' },
  { src: '/images/wedding/night/night-02-juego-zapato.webp',      cat: 'boda', wide: true,  type: 'Recepción', caption: 'Pura alegría', alt: 'La novia riendo durante el tradicional juego del zapato' },
  { src: '/images/wedding/night/night-03-liga.webp',              cat: 'boda', wide: false, type: 'Recepción', caption: 'Una tradición divertida', alt: 'El novio lanzando la liga durante la recepción, en blanco y negro' },
  { src: '/images/wedding/night/night-04-invitados-bailando.webp', cat: 'boda', wide: true,  type: 'Recepción', caption: 'La fiesta no para', alt: 'Invitados bailando y celebrando bajo las palmeras al atardecer' },
  { src: '/images/wedding/night/night-05-buffet-novio.webp',      cat: 'boda', wide: false, type: 'Recepción', caption: 'Celebrando con los suyos', alt: 'El novio sirviéndose en el buffet durante la recepción' },
  { src: '/images/wedding/night/night-06-abrazo-invitadas.webp',  cat: 'boda', wide: false, type: 'Recepción', caption: 'Abrazos de celebración', alt: 'Abrazo emotivo entre invitadas tras el lanzamiento del ramo' },
  { src: '/images/wedding/night/night-07-novia-cantando.webp',    cat: 'boda', wide: true,  type: 'Recepción', caption: 'La celebración continúa', alt: 'La novia cantando junto a sus damas de honor en la recepción' },
  { src: '/images/wedding/night/night-08-brindis-grupal.webp',    cat: 'boda', wide: true,  type: 'Recepción', caption: 'Un brindis por el amor', alt: 'Brindis grupal de la novia y sus damas de honor con lentes de corazón' },
  // Pre-boda — Arihanna & Raymer
  { src: '/images/wedding/pre-boda/preboda-07-torii-rojo.webp',         cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'Arihanna & Raymer — Antes del sí', alt: 'Los novios caminando de la mano bajo un torii rojo en un jardín japonés' },
  { src: '/images/wedding/pre-boda/preboda-01-abrazo-bosque.webp',      cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'Un abrazo en el bosque', alt: 'Los novios abrazados de espaldas en medio del bosque' },
  { src: '/images/wedding/pre-boda/preboda-02-frente-frente.webp',      cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'A punto del beso', alt: 'Los novios frente a frente a punto de besarse' },
  { src: '/images/wedding/pre-boda/preboda-03-ramo-detalle.webp',       cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'Detalles que enamoran', alt: 'Primer plano del ramo de flores de la sesión pre-boda' },
  { src: '/images/wedding/pre-boda/preboda-04-caminando-sendero.webp',  cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'La anticipación', alt: 'Los novios caminando de la mano por un sendero arbolado' },
  { src: '/images/wedding/pre-boda/preboda-05-retrato-bambu.webp',      cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'Amor en cada mirada', alt: 'Retrato de la novia sonriendo entre un bosque de bambú' },
  { src: '/images/wedding/pre-boda/preboda-06-abrazo-bambu.webp',       cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'Rodeados de naturaleza', alt: 'Los novios abrazados entre el bosque de bambú' },
  { src: '/images/wedding/pre-boda/preboda-08-paseo-lago.webp',         cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'Un paseo junto al lago', alt: 'Los novios caminando de la mano junto a un lago' },
  { src: '/images/wedding/pre-boda/preboda-09-riendo-picnic.webp',      cat: 'preboda', wide: true,  type: 'Sesión Pre-boda', caption: 'Momentos de complicidad', alt: 'Los novios riendo juntos durante un picnic en el jardín' },
  { src: '/images/wedding/pre-boda/preboda-10-anillo-compromiso.webp',  cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'El anillo que lo empezó todo', alt: 'Los novios mostrando el anillo de compromiso' },
]

const filters = [
  { key: 'all',       label: 'Todos' },
  { key: 'propuesta', label: 'Propuestas de Mano' },
  { key: 'preboda',   label: 'Pre-boda' },
  { key: 'boda',      label: 'Bodas' },
  { key: 'postboda',  label: 'Post Boda' },
]

export default function Portfolio() {
  const [active, setActive] = useState('all')
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

  const visible = active === 'all' ? items : items.filter(i => i.cat === active)

  return (
    <section id="portfolio" style={{ background: 'var(--gray-light)' }} ref={ref}>
      <div className="container">
        <div className="portfolio-header fade-up">
          <span className="tag">Nuestro Trabajo</span>
          <h2 className="section-title">Momentos que hablan por sí solos</h2>
          <p className="section-sub">
            Cada evento que creamos es una historia de amor única. Aquí, algunos de nuestros trabajos más especiales.
          </p>
        </div>

        <div className="portfolio-filters">
          {filters.map(f => (
            <button
              key={f.key}
              className={`filter-btn${active === f.key ? ' active' : ''}`}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="portfolio-grid">
          {visible.map((item, i) => (
            <div key={i} className={`portfolio-item${item.wide ? ' wide' : ''}`}>
              <img src={item.src} alt={item.alt || `${item.type} — ${item.caption}`} loading="lazy" />
              <div className="portfolio-overlay">
                <div className="portfolio-overlay-content">
                  <p className="type">{item.type}</p>
                  <p>{item.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

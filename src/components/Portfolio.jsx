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
  { src: '/images/wedding/getting-ready/getting-ready-01-maquillaje.webp',    cat: 'boda', wide: true,  type: 'Preparación de la Novia', caption: 'Los últimos retoques', alt: 'Novia recibiendo los últimos retoques de maquillaje antes de la boda' },
  { src: '/images/wedding/getting-ready/getting-ready-02-detalles.webp',      cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Los detalles importan', alt: 'Ramo de novia, zapatos y perfume sobre el velo, foto de detalles' },
  { src: '/images/wedding/getting-ready/getting-ready-03-collar.webp',        cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Elegancia en cada detalle', alt: 'Primer plano del collar de la novia' },
  { src: '/images/wedding/getting-ready/getting-ready-04-damas-novia.webp',   cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Rodeada de las suyas', alt: 'La novia junto a sus damas de honor antes de la ceremonia' },
  { src: '/images/wedding/getting-ready/getting-ready-05-diversion.webp',     cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Pura diversión antes del sí', alt: 'Novia y damas de honor riendo con lentes de sol de corazón' },
  { src: '/images/wedding/getting-ready/getting-ready-06-balcon.webp',        cat: 'boda', wide: false, type: 'Preparación de la Novia', caption: 'Un momento a solas', alt: 'Novia sonriendo en el balcón antes de bajar a la ceremonia' },
  { src: '/images/wedding/getting-ready/getting-ready-07-novio-zapatos.webp', cat: 'boda', wide: false, type: 'Preparación del Novio', caption: 'Listo para el gran día', alt: 'Novio terminando de vestirse, ajustándose los zapatos' },
  { src: '/images/wedding/getting-ready/getting-ready-08-padrinos.webp',      cat: 'boda', wide: true,  type: 'Preparación del Novio', caption: 'El novio y sus padrinos', alt: 'Novio junto a sus padrinos de boda antes de la ceremonia' },
  // Bodas — Raymer & Arihanna (ceremonia)
  { src: '/images/wedding/ceremony/ceremony-01-entrada-novia.webp',       cat: 'boda', wide: true,  type: 'Ceremonia', caption: 'Raymer & Arihanna — El gran día', alt: 'Novia entrando a la ceremonia del brazo de su padre' },
  { src: '/images/wedding/ceremony/ceremony-02-paje-anillos.webp',        cat: 'boda', wide: false, type: 'Ceremonia', caption: 'El paje de los anillos', alt: 'Niño paje sonriente cargando el libro de los anillos' },
  { src: '/images/wedding/ceremony/ceremony-03-nina-flores.webp',         cat: 'boda', wide: false, type: 'Ceremonia', caption: 'La niña de las flores', alt: 'Niña de las flores caminando por el pasillo de la ceremonia' },
  { src: '/images/wedding/ceremony/ceremony-04-caminando-altar.webp',     cat: 'boda', wide: false, type: 'Ceremonia', caption: 'Camino al altar', alt: 'Novia caminando hacia el altar entre los invitados' },
  { src: '/images/wedding/ceremony/ceremony-05-frente-altar.webp',        cat: 'boda', wide: true,  type: 'Ceremonia', caption: 'Frente al altar', alt: 'Los novios de pie frente al altar durante la ceremonia' },
  { src: '/images/wedding/ceremony/ceremony-06-intercambio-anillos.webp', cat: 'boda', wide: false, type: 'Ceremonia', caption: 'El intercambio de anillos', alt: 'Primer plano del intercambio de anillos de boda' },
  { src: '/images/wedding/ceremony/ceremony-07-primer-beso.webp',         cat: 'boda', wide: false, type: 'Ceremonia', caption: 'El primer beso', alt: 'Los novios compartiendo su primer beso como esposos' },
  { src: '/images/wedding/ceremony/ceremony-08-novios-felices.webp',      cat: 'boda', wide: false, type: 'Ceremonia', caption: 'Radiantes de felicidad', alt: 'Novios sonriendo juntos con su ramo de flores' },
  { src: '/images/wedding/ceremony/ceremony-09-paseo-romantico.webp',     cat: 'boda', wide: false, type: 'Ceremonia', caption: 'Un paseo romántico', alt: 'Los novios caminando de la mano entre la vegetación tropical' },
  { src: '/images/wedding/ceremony/ceremony-10-retrato-novios.webp',      cat: 'boda', wide: false, type: 'Ceremonia', caption: 'Retrato de los novios', alt: 'Retrato de los novios espalda con espalda sosteniendo el ramo' },
  { src: '/images/wedding/ceremony/ceremony-11-familia-completa.webp',    cat: 'boda', wide: true,  type: 'Ceremonia', caption: 'La familia al completo', alt: 'Foto grupal de los novios junto a familiares y amigos' },
  // Bodas — Raymer & Arihanna (recepción / noche)
  { src: '/images/wedding/night/night-01-llegada-recepcion.webp', cat: 'boda', wide: false, type: 'Recepción', caption: 'La noche de Arihanna', alt: 'Novia llegando a la recepción nocturna con lentes de corazón' },
  { src: '/images/wedding/night/night-02-novios-mesa.webp',       cat: 'boda', wide: false, type: 'Recepción', caption: 'En la mesa principal', alt: 'Los novios sentados en la mesa principal durante la recepción' },
  { src: '/images/wedding/night/night-03-padrinos-risas.webp',    cat: 'boda', wide: false, type: 'Recepción', caption: 'Risas entre padrinos', alt: 'Padrinos de boda riendo durante la recepción' },
  { src: '/images/wedding/night/night-04-diversion-novia.webp',   cat: 'boda', wide: true,  type: 'Recepción', caption: 'Pura alegría', alt: 'Novios entre risas durante un juego en la recepción' },
  { src: '/images/wedding/night/night-05-celebracion.webp',       cat: 'boda', wide: false, type: 'Recepción', caption: 'La celebración continúa', alt: 'Novia cantando junto a sus damas de honor en la recepción' },
  { src: '/images/wedding/night/night-06-brindis.webp',           cat: 'boda', wide: false, type: 'Recepción', caption: 'Un brindis por el amor', alt: 'Novia brindando con una copa durante la fiesta de recepción' },
  // Pre-boda
  { src: 'https://images.pixieset.com/54390439/0619163de4fd6ebe7b9fccec3da957cc-cover.JPG',   cat: 'preboda', wide: true,  type: 'Sesión Pre-boda', caption: 'Arihanna & Raymer — Antes del sí' },
  { src: 'https://images.pixieset.com/67964079/37fbbb3c6dc2ff07d68877370e3e0cd5-cover.JPG',   cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'La anticipación' },
  { src: 'https://images.pixieset.com/67964079/0b9fca326b50d06fe63f63877ad8e2b6-large.JPG',   cat: 'preboda', wide: false, type: 'Sesión Pre-boda', caption: 'Amor en cada mirada' },
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

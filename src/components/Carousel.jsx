const row1 = [
  { src: 'https://images.pixieset.com/676945401/1f41b9a9fa9fdcaf520a4be8f13c5310-cover.jpg', label: 'Propuesta', tall: false },
  { src: 'https://images.pixieset.com/676945401/251c17f39894a72c4e1cc1530e9c85c1-large.jpg', label: 'Propuesta', tall: true },
  { src: 'https://images.pixieset.com/676945401/7585ba2b13d9d17f62515e02490abfca-large.jpg', label: 'Propuesta', tall: false },
  { src: 'https://images.pixieset.com/676945401/460e50e3761c29d766e53a4550379b65-large.jpg', label: 'Propuesta', tall: false },
  { src: 'https://images.pixieset.com/676945401/5c530b6cc8378aac15e29520ece0c3c2-large.jpg', label: 'Propuesta', tall: true },
  { src: 'https://images.pixieset.com/676945401/cd432f0fe4af677de4ccc26d016dc6a7-large.jpg', label: 'Propuesta', tall: false },
  { src: 'https://images.pixieset.com/676945401/bd330166d1f89637fcd9b2c3557dd26e-large.jpg', label: 'Propuesta', tall: false },
  { src: 'https://images.pixieset.com/56159669/3ddb088f2f8d43164c58b1c78ee847ae-cover.jpg', label: 'Post Boda', tall: true },
  { src: 'https://images.pixieset.com/54390439/0619163de4fd6ebe7b9fccec3da957cc-cover.JPG', label: 'Pre-Boda', tall: false },
]

const row2 = [
  { src: 'https://images.pixieset.com/67964079/37fbbb3c6dc2ff07d68877370e3e0cd5-cover.JPG', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/fcf903d16b4182f9937c3018ad285ae3-large.jpg', label: 'Boda', tall: true },
  { src: 'https://images.pixieset.com/67964079/2eb19e196375a8ca60889c8572aaee15-large.jpg', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/fbbf570dc5a4c9f2a2278fa5c77936d0-large.jpg', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/3f265f04b118bdb2c21114ff7fa4a8a2-large.jpg', label: 'Boda', tall: true },
  { src: 'https://images.pixieset.com/67964079/74a20f1cac2a5f3bb6f30155bbe2b695-large.jpg', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/56159669/27fdc03d5b83e29819016b47730e948a-large.JPG', label: 'Post Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/7194820a72c5c9bdc068501d48a20896-large.jpg', label: 'Boda', tall: true },
  { src: 'https://images.pixieset.com/67964079/79ef059a00f2f8633e2d36620fe992cc-large.jpg', label: 'Boda', tall: false },
]

const row3 = [
  { src: 'https://images.pixieset.com/67964079/8b8f62fb21f2fffd242b5469777dd14d-large.JPG', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/21e63d9a457d322497fb1905fadbc3c1-large.JPG', label: 'Boda', tall: true },
  { src: 'https://images.pixieset.com/67964079/e13f41f3665c63763d41d228d56d05df-large.JPG', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/4ad9cce69825ae205245c8ae902dc999-large.JPG', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/ccf554d3822a142d0a661f6c76bf1e48-large.JPG', label: 'Boda', tall: true },
  { src: 'https://images.pixieset.com/67964079/c521fda522f438bbe9ecbe5b8c828201-large.JPG', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/cca6726da9313d966abe6eab57dc7767-large.JPG', label: 'Boda', tall: false },
  { src: 'https://images.pixieset.com/67964079/7b1701ddd6741cee9d85c544e4845418-large.JPG', label: 'Boda', tall: true },
  { src: 'https://images.pixieset.com/67964079/b36b068c236673828ec7411c4ca80528-large.jpg', label: 'Boda', tall: false },
]

function Track({ items, rowClass }) {
  const doubled = [...items, ...items]
  return (
    <div className={`carousel-track ${rowClass}`}>
      {doubled.map((item, i) => (
        <div key={i} className={`carousel-slide${item.tall ? ' tall' : ''}`}>
          <img src={item.src} alt={item.label} loading="lazy" />
          <span className="carousel-slide-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Carousel() {
  return (
    <section className="carousel-section">
      <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 28px' }}>
        <span className="tag">Galería de Momentos</span>
        <h2 style={{ color: '#fff', fontSize: 'clamp(28px,4vw,44px)', fontFamily: 'var(--serif)' }}>
          Cada foto cuenta una historia
        </h2>
      </div>
      <div className="carousel-track-wrap">
        <Track items={row1} rowClass="row-1" />
        <Track items={row2} rowClass="row-2" />
        <Track items={row3} rowClass="row-3" />
      </div>
    </section>
  )
}

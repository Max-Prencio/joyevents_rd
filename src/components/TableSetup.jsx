import { ContainerScroll } from './ui/container-scroll-animation'

export default function TableSetup() {
  return (
    <section id="montaje" style={{ background: 'var(--off-white)', overflow: 'hidden' }}>
      <ContainerScroll
        titleComponent={
          <>
            <span className="tag">Nuestro Sello</span>
            <h2 className="section-title" style={{ textAlign: 'center' }}>
              El Montaje <span style={{ color: 'var(--orange)' }}>Perfecto</span>
            </h2>
            <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
              Del mantel al último souvenir: así vestimos una mesa Joy Events, detalle a detalle.
            </p>
          </>
        }
      >
        <img
          src="/images/table-setup/classic.webp"
          alt="Montaje de mesa de boda Joy Events, estilo clásico elegante con dorado y blanco"
          className="mx-auto rounded-2xl object-cover h-full w-full object-top"
          draggable={false}
        />
      </ContainerScroll>
    </section>
  )
}

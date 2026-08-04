import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function MesaScroll() {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const headlineRef = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const headline = headlineRef.current
    const subtitle = subtitleRef.current
    const cta = ctaRef.current

    video.pause()
    gsap.set(subtitle, { opacity: 0 })

    if (window.innerWidth < 768) {
      video.currentTime = 0
      gsap.set(headline, { opacity: 1 })
      gsap.set(cta, { opacity: 1 })
      return
    }

    gsap.set(headline, { opacity: 0 })
    gsap.set(cta, { opacity: 0 })

    let scrollTrigger
    const buildTimeline = () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=400%',
          scrub: true,
          pin: true,
          anticipatePin: 1,
          onUpdate: self => {
            if (video.duration) video.currentTime = self.progress * video.duration
          },
        },
      })
        .to(headline, { opacity: 1, duration: 0.2 }, 0)
        .to(headline, { opacity: 0, duration: 0.15 }, 0.7)
        .to(subtitle, { opacity: 1, duration: 0.15 }, 0.7)
        .to(subtitle, { opacity: 0, duration: 0.15 }, 0.85)
        .to(cta, { opacity: 1, duration: 0.15 }, 0.85)
      scrollTrigger = tl.scrollTrigger
    }

    if (video.readyState >= 1) {
      buildTimeline()
    } else {
      video.addEventListener('loadedmetadata', buildTimeline, { once: true })
    }

    return () => {
      video.removeEventListener('loadedmetadata', buildTimeline)
      scrollTrigger?.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="mesa-scroll-section">
      <video
        ref={videoRef}
        className="mesa-scroll-video"
        src="/videos/mesa.mp4"
        muted
        playsInline
        preload="auto"
      />
      <div className="mesa-scroll-overlay">
        <h2 ref={headlineRef} className="mesa-scroll-item mesa-scroll-headline">
          Cada Detalle, Perfectamente Orquestado
        </h2>
        <p ref={subtitleRef} className="mesa-scroll-item mesa-scroll-subtitle">
          Convertimos tu visión en una experiencia inolvidable
        </p>
        <a ref={ctaRef} href="#agenda" className="btn btn-primary mesa-scroll-item mesa-scroll-cta">
          Agenda tu Consulta →
        </a>
      </div>
    </section>
  )
}

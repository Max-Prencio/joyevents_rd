import { useEffect } from 'react'
import Lenis from 'lenis'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import Carousel     from './components/Carousel'
import About        from './components/About'
import Services     from './components/Services'
import TableSetup   from './components/TableSetup'
import Portfolio    from './components/Portfolio'
import Founder      from './components/Founder'
import Team         from './components/Team'
import Testimonials from './components/Testimonials'
import Calendar     from './components/Calendar'
import Contact      from './components/Contact'
import Footer       from './components/Footer'

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    let rafId
    const raf = time => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <Navbar />
      <Hero />
      <Carousel />
      <About />
      <Services />
      <TableSetup />
      <Portfolio />
      <Founder />
      <Team />
      <Testimonials />
      <Calendar />
      <Contact />
      <Footer />
    </>
  )
}

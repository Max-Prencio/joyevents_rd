import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import MesaScroll   from './components/MesaScroll'
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

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    const onLenisScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onLenisScroll)

    const tick = time => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.off('scroll', onLenisScroll)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <Navbar />
      <Hero />
      <MesaScroll />
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

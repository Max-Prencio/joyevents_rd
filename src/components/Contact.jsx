import { Smartphone, Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { FORM_CONTACT_URL, WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from '../config'

const EMPTY = { name:'', email:'', whatsapp:'', tipo:'', mensaje:'' }

export default function Contact() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.fade-up') ?? []
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.05 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const [form, setForm]       = useState(EMPTY)
  const [status, setStatus]   = useState('idle') // idle | sending | success | error

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    const isConfigured = !FORM_CONTACT_URL.includes('CONTACT_FORM_ID')

    if (!isConfigured) {
      // Fallback: abrir WhatsApp con el mensaje prellenado
      const msg = encodeURIComponent(
        `Hola Joy Events 🌸\n` +
        `Nombre: ${form.name}\n` +
        `Email: ${form.email}\n` +
        `WhatsApp: ${form.whatsapp}\n` +
        `Tipo de evento: ${form.tipo || 'No especificado'}\n\n` +
        `${form.mensaje}`
      )
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(FORM_CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          nombre:    form.name,
          email:     form.email,
          whatsapp:  form.whatsapp,
          tipo:      form.tipo,
          mensaje:   form.mensaje,
        }),
      })
      if (res.ok) {
        setStatus('success')
        setForm(EMPTY)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="contact-section" id="contact" ref={ref}>
      <div className="container">
        <div className="contact-grid">
          {/* Info */}
          <div className="contact-info fade-up">
            <span className="tag">Contáctanos</span>
            <h2 className="section-title" style={{ color: '#fff' }}>¿Listo para tu evento soñado?</h2>
            <p className="section-sub" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 40 }}>
              Cuéntanos sobre el evento que tienes en mente. Estamos listas para escucharte y
              convertir tu visión en una realidad inolvidable.
            </p>
            {[
              { icon: <Smartphone size={20} />, title: 'WhatsApp',  value: WHATSAPP_DISPLAY },
              { icon: <Mail size={20} />,       title: 'Email',     value: 'joyeventsrd@gmail.com' },
              { icon: <MapPin size={20} />,     title: 'Ubicación', value: 'Santo Domingo, República Dominicana' },
            ].map(d => (
              <div key={d.title} className="contact-detail">
                <div className="icon">{d.icon}</div>
                <div>
                  <h4>{d.title}</h4>
                  <p>{d.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form className="contact-form fade-up" onSubmit={handleSubmit}>
            {status === 'success' ? (
              <div className="form-success">
                <CheckCircle size={48} style={{ color: '#4ade80', marginBottom: 16 }} />
                <h3 style={{ color: '#fff', fontFamily: 'var(--serif)', fontSize: 26 }}>¡Mensaje enviado!</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                  Nos pondremos en contacto contigo pronto. También puedes escribirnos directamente
                  por WhatsApp para una respuesta más rápida.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}
                  onClick={() => setStatus('idle')}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                {status === 'error' && (
                  <div className="form-error-banner">
                    <AlertCircle size={18} />
                    <span>Error al enviar. Por favor intenta de nuevo o escríbenos por WhatsApp.</span>
                  </div>
                )}
                <input
                  type="text" placeholder="Tu nombre completo" required
                  value={form.name} onChange={set('name')}
                />
                <input
                  type="email" placeholder="Tu email" required
                  value={form.email} onChange={set('email')}
                />
                <input
                  type="tel" placeholder="Tu WhatsApp"
                  value={form.whatsapp} onChange={set('whatsapp')}
                />
                <select value={form.tipo} onChange={set('tipo')}>
                  <option value="">Tipo de evento</option>
                  <option value="Boda">Boda</option>
                  <option value="Petición de Mano">Petición de Mano</option>
                  <option value="Cumpleaños">Cumpleaños</option>
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Evento Social">Evento Social</option>
                  <option value="Otro">Otro</option>
                </select>
                <textarea
                  placeholder="Cuéntanos sobre tu evento..." rows={4}
                  value={form.mensaje} onChange={set('mensaje')}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', gap: 10 }}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <><span className="btn-spinner" /> Enviando...</>
                  ) : (
                    <><Send size={16} /> Enviar Mensaje ✦</>
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

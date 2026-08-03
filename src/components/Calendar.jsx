import { useState, useEffect, useRef } from 'react'
import { CalendarCheck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from '../config'
import { SLOTS as SLOT_DEFS } from '../slots'
import { isDRHoliday, isWeekend as isWeekendDate } from '../holidays'

const REASON_TEXT = {
  weekend: 'No ofrecemos consultas los fines de semana. Elige un día entre semana.',
  holiday: 'Ese día es feriado en República Dominicana. Elige otra fecha.',
  max: 'Ya se alcanzó el máximo de consultas para este día. Prueba otra fecha.',
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS   = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']
const SLOTS  = SLOT_DEFS.map(s => s.label)

function getMonthDays(year, month) {
  const first   = new Date(year, month, 1).getDay()
  const daysInM = new Date(year, month + 1, 0).getDate()
  const days    = []
  for (let i = 0; i < first; i++) days.push(null)
  for (let d = 1; d <= daysInM; d++) days.push(d)
  return days
}

export default function Calendar() {
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

  const today       = new Date()
  const [yr, setYr]   = useState(today.getFullYear())
  const [mo, setMo]   = useState(today.getMonth())
  const [selDay, setSel] = useState(null)
  const [selSlot, setSlot] = useState(null)
  const EMPTY_FORM = { nombre:'', apellido:'', whatsapp:'', email:'', tipo:'', fecha:'', mensaje:'' }
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const [availSlots, setAvailSlots] = useState(SLOTS)
  const [availReason, setAvailReason] = useState(null)
  const [availLoading, setAvailLoading] = useState(false)
  const [availError, setAvailError] = useState(false)

  useEffect(() => {
    if (!selDay) return
    const dateStr = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`
    let cancelled = false
    setAvailLoading(true)
    setAvailError(false)
    setAvailReason(null)
    fetch(`/api/availability?date=${dateStr}`)
      .then(res => { if (!res.ok) throw new Error('request failed'); return res.json() })
      .then(data => { if (!cancelled) { setAvailSlots(data.available ?? SLOTS); setAvailReason(data.reason ?? null) } })
      .catch(() => { if (!cancelled) { setAvailError(true); setAvailSlots(SLOTS) } })
      .finally(() => { if (!cancelled) setAvailLoading(false) })
    return () => { cancelled = true }
  }, [selDay, mo, yr])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const days = getMonthDays(yr, mo)

  const prev = () => { if (mo === 0) { setMo(11); setYr(y => y - 1) } else setMo(m => m - 1); setSel(null); setSlot(null) }
  const next = () => { if (mo === 11) { setMo(0); setYr(y => y + 1) } else setMo(m => m + 1); setSel(null); setSlot(null) }

  const isPast = d => d && new Date(yr, mo, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isToday = d => d && yr === today.getFullYear() && mo === today.getMonth() && d === today.getDate()
  const dayISO = d => `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const isWeekend = d => d && isWeekendDate(dayISO(d))
  const isHoliday = d => d && isDRHoliday(dayISO(d))
  const isBlocked = d => isPast(d) || isWeekend(d) || isHoliday(d)

  const fechaSeleccionada = selDay ? `${selDay}/${mo+1}/${yr}${selSlot ? ` a las ${selSlot}` : ''}` : 'No seleccionada'
  const fechaISO = selDay ? `${yr}-${String(mo + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}` : null
  const selHour = selSlot ? SLOT_DEFS.find(s => s.label === selSlot)?.hour ?? null : null

  const handleSubmit = async e => {
    e.preventDefault()

    if (!selDay || !selSlot) {
      setStatus('error')
      setErrorMsg('Selecciona una fecha y un horario antes de solicitar la llamada.')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/request-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:         `${form.nombre} ${form.apellido}`,
          email:          form.email,
          whatsapp:       form.whatsapp,
          tipo:           form.tipo,
          fechaConsulta:  fechaSeleccionada,
          fechaISO:       fechaISO,
          hora:           selHour,
          fechaEvento:    form.fecha,
          mensaje:        form.mensaje,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus('success')
        setForm(EMPTY_FORM)
        setSel(null)
        setSlot(null)
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Error al enviar. Por favor intenta de nuevo.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Error al enviar. Por favor intenta de nuevo.')
    }
  }

  const whatsappFallback = () => {
    const msg = encodeURIComponent(
      `Hola Joy Events 🌸 Quiero reservar una consulta!\n` +
      `Nombre: ${form.nombre} ${form.apellido}\n` +
      `WhatsApp: ${form.whatsapp}\n` +
      `Email: ${form.email}\n` +
      `Tipo de evento: ${form.tipo || 'No especificado'}\n` +
      `Fecha consulta: ${fechaSeleccionada}\n` +
      `Fecha estimada del evento: ${form.fecha || 'Por definir'}\n\n` +
      `${form.mensaje}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  return (
    <section className="calendar-section" id="agenda" ref={ref}>
      <div className="container">
        <div className="fade-up">
          <span className="tag">Agenda tu Consulta</span>
          <h2 className="section-title">Hablemos de tu Evento</h2>
          <p className="section-sub">
            Selecciona una fecha y hora disponible para una llamada con nuestras administradoras. Sin costo, sin compromisos.
          </p>
        </div>

        <div className="calendar-wrapper">
          {/* Calendar widget */}
          <div className="calendar-widget fade-up">
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={prev}>‹</button>
              <h3>{MONTHS[mo]} {yr}</h3>
              <button className="cal-nav-btn" onClick={next}>›</button>
            </div>
            <div className="cal-days-header">
              {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
            </div>
            <div className="cal-days">
              {days.map((d, i) => (
                <button
                  key={i}
                  className={`cal-day ${!d ? 'empty' : ''} ${isBlocked(d) ? 'past' : 'available'} ${isToday(d) ? 'today' : ''} ${selDay === d ? 'selected' : ''}`}
                  onClick={() => { if (d && !isBlocked(d)) { setSel(d); setSlot(null) } }}
                  disabled={!d || isBlocked(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            {selDay && (
              <div className="time-slots" style={{ display: 'block' }}>
                <h4>Horarios disponibles — {selDay}/{mo+1}/{yr}</h4>
                {availLoading ? (
                  <div className="slots-loading">
                    <Loader2 size={16} className="spin" /> Verificando disponibilidad...
                  </div>
                ) : (
                  <>
                    {availError && (
                      <div className="avail-warning">
                        <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>No pudimos verificar disponibilidad en tiempo real. Podrás elegir un horario y lo confirmaremos manualmente.</span>
                      </div>
                    )}
                    <div className="slots-grid">
                      {SLOTS.map(s => {
                        const isAvailable = availSlots.includes(s)
                        return (
                          <button
                            key={s}
                            className={`time-slot${selSlot === s ? ' selected' : ''}${!isAvailable ? ' unavailable' : ''}`}
                            onClick={() => { if (isAvailable) setSlot(s) }}
                            disabled={!isAvailable}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                    {!availError && availSlots.length === 0 && (
                      <p className="no-slots">{REASON_TEXT[availReason] ?? 'No hay horarios disponibles este día. Prueba otra fecha.'}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Booking form */}
          <div className="booking-form fade-up">
            <h3>Reserva tu Consulta</h3>
            <p className="booking-sub">Completa el formulario y nos pondremos en contacto para confirmar tu llamada.</p>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <CheckCircle size={52} style={{ color: 'var(--orange)', marginBottom: 16 }} />
                <h4 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 8 }}>¡Solicitud enviada!</h4>
                <p style={{ color: 'var(--gray)', fontSize: 14, lineHeight: 1.7 }}>
                  Le avisamos a Joy Events sobre tu solicitud. Te llegará un correo confirmando si tu
                  llamada fue aprobada para la fecha y hora elegidas.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: 20 }}
                  onClick={() => setStatus('idle')}
                >
                  Hacer otra reserva
                </button>
              </div>
            ) : (
              <>
                {selDay && selSlot && (
                  <div className="selected-info visible">
                    📅 Seleccionado: {selDay}/{mo+1}/{yr} a las {selSlot}
                  </div>
                )}

                {status === 'error' && (
                  <div className="form-error-banner" style={{ marginBottom: 12, background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={16} />
                    <span>
                      {errorMsg}{' '}
                      <button type="button" onClick={whatsappFallback} style={{ color: '#ef4444', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                        Escríbenos por WhatsApp
                      </button>
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre</label>
                      <input type="text" placeholder="Tu nombre" required value={form.nombre} onChange={set('nombre')} />
                    </div>
                    <div className="form-group">
                      <label>Apellido</label>
                      <input type="text" placeholder="Tu apellido" required value={form.apellido} onChange={set('apellido')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input type="tel" placeholder="+1 (849) 000-0000" required value={form.whatsapp} onChange={set('whatsapp')} />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" placeholder="tu@email.com" required value={form.email} onChange={set('email')} />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Evento</label>
                    <select required value={form.tipo} onChange={set('tipo')}>
                      <option value="">Selecciona...</option>
                      <option>Boda</option>
                      <option>Petición de Mano</option>
                      <option>Cumpleaños</option>
                      <option>Baby Shower</option>
                      <option>Evento Social</option>
                      <option>Aniversario</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha estimada del evento</label>
                    <input type="date" value={form.fecha} onChange={set('fecha')} />
                  </div>
                  <div className="form-group">
                    <label>¿Cuéntanos más sobre tu evento?</label>
                    <textarea placeholder="Describe brevemente tu visión..." value={form.mensaje} onChange={set('mensaje')} />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '16px', marginTop: 8 }}
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <><span className="btn-spinner" /> Enviando...</>
                    ) : 'Solicitar Llamada ✦'}
                  </button>
                </form>
              </>
            )}

            <div className="calendar-note">
              <CalendarCheck size={18} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong>Confirmación por email:</strong> Joy Events revisará tu solicitud y recibirás un correo
                confirmando si la llamada fue aprobada para la fecha elegida. También puedes contactarnos
                directamente al <strong>{WHATSAPP_DISPLAY}</strong> o a <strong>joyeventsrd@gmail.com</strong>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

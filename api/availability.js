import { google } from 'googleapis'
import { SLOTS } from '../src/slots.js'

// República Dominicana no observa horario de verano — offset fijo.
const TZ_OFFSET = '-04:00'

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  if (!email || !key) return null
  return new google.auth.JWT(email, null, key, ['https://www.googleapis.com/auth/calendar.readonly'])
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

export default async function handler(req, res) {
  const { date } = req.query

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Parámetro "date" inválido. Usa formato YYYY-MM-DD.' })
    return
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const auth = getAuth()

  // Sin credenciales configuradas todavía: modo degradado, todos los horarios se muestran disponibles.
  if (!auth || !calendarId) {
    res.status(200).json({ date, available: SLOTS.map(s => s.label), configured: false })
    return
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth })
    const timeMin = `${date}T00:00:00${TZ_OFFSET}`
    const timeMax = `${date}T23:59:59${TZ_OFFSET}`

    const { data } = await calendar.freebusy.query({
      requestBody: { timeMin, timeMax, items: [{ id: calendarId }] },
    })

    const busy = data.calendars?.[calendarId]?.busy ?? []

    const available = SLOTS
      .filter(slot => {
        const slotStart = new Date(`${date}T${String(slot.hour).padStart(2, '0')}:00:00${TZ_OFFSET}`)
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)
        return !busy.some(b => overlaps(slotStart, slotEnd, new Date(b.start), new Date(b.end)))
      })
      .map(s => s.label)

    res.status(200).json({ date, available, configured: true })
  } catch (err) {
    console.error('Error consultando disponibilidad de Google Calendar:', err)
    res.status(500).json({ error: 'No se pudo consultar disponibilidad en este momento.' })
  }
}

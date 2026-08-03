import { google } from 'googleapis'
import { getGoogleAuth, TZ_OFFSET, TZ_NAME } from './googleAuth.js'

// Crea el evento en el Google Calendar de Joy Events. Devuelve null si las
// credenciales no están configuradas (modo degradado, no rompe el flujo de aceptación).
export async function createCalendarEvent({ summary, description, date, hour, durationMinutes = 60 }) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const auth = getGoogleAuth()
  if (!auth || !calendarId || !date || hour == null) return null

  const calendar = google.calendar({ version: 'v3', auth })
  const start = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00${TZ_OFFSET}`)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  const { data } = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      start: { dateTime: start.toISOString(), timeZone: TZ_NAME },
      end: { dateTime: end.toISOString(), timeZone: TZ_NAME },
    },
  })
  return data
}

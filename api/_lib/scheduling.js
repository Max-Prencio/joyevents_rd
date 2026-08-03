import { google } from 'googleapis'
import { getGoogleAuth, TZ_OFFSET, TZ_NAME } from './googleAuth.js'
import { SLOTS } from '../../src/slots.js'
import { isDRHoliday, isWeekend } from '../../src/holidays.js'

const MAX_CALLS_PER_DAY = 3

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

async function fetchDayEvents(date) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const auth = getGoogleAuth()
  if (!auth || !calendarId) return null

  const calendar = google.calendar({ version: 'v3', auth })
  const { data } = await calendar.events.list({
    calendarId,
    timeMin: `${date}T00:00:00${TZ_OFFSET}`,
    timeMax: `${date}T23:59:59${TZ_OFFSET}`,
    singleEvents: true,
    orderBy: 'startTime',
  })

  return (data.items || []).filter(e => e.status !== 'cancelled')
}

// reason: 'weekend' | 'holiday' | 'max' | null
export async function getAvailability(date) {
  if (isWeekend(date)) return { available: [], reason: 'weekend', configured: true }
  if (isDRHoliday(date)) return { available: [], reason: 'holiday', configured: true }

  const events = await fetchDayEvents(date)
  if (events === null) {
    return { available: SLOTS.map(s => s.label), reason: null, configured: false }
  }

  const acceptedCount = events.filter(e => e.extendedProperties?.private?.joyStatus === 'accepted').length
  if (acceptedCount >= MAX_CALLS_PER_DAY) {
    return { available: [], reason: 'max', configured: true }
  }

  const available = SLOTS
    .filter(slot => {
      const slotStart = new Date(`${date}T${String(slot.hour).padStart(2, '0')}:00:00${TZ_OFFSET}`)
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)
      return !events.some(e => {
        const evStart = new Date(e.start.dateTime || e.start.date)
        const evEnd = new Date(e.end.dateTime || e.end.date)
        return overlaps(slotStart, slotEnd, evStart, evEnd)
      })
    })
    .map(s => s.label)

  return { available, reason: null, configured: true }
}

export async function holdSlot({ date, hour, summary, description }) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const auth = getGoogleAuth()
  if (!auth || !calendarId) return null

  const calendar = google.calendar({ version: 'v3', auth })
  const start = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00${TZ_OFFSET}`)
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  const { data } = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      start: { dateTime: start.toISOString(), timeZone: TZ_NAME },
      end: { dateTime: end.toISOString(), timeZone: TZ_NAME },
      extendedProperties: { private: { joyStatus: 'pending' } },
    },
  })
  return data.id
}

export async function confirmSlot(eventId, { summary, description }) {
  const auth = getGoogleAuth()
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!auth || !calendarId || !eventId) return
  const calendar = google.calendar({ version: 'v3', auth })
  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: {
      summary,
      description,
      extendedProperties: { private: { joyStatus: 'accepted' } },
    },
  })
}

export async function releaseSlot(eventId) {
  const auth = getGoogleAuth()
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  if (!auth || !calendarId || !eventId) return
  const calendar = google.calendar({ version: 'v3', auth })
  try {
    await calendar.events.delete({ calendarId, eventId })
  } catch (err) {
    if (err.code !== 410 && err.code !== 404) throw err
  }
}

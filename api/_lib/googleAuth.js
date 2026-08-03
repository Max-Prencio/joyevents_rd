import { google } from 'googleapis'

// República Dominicana no observa horario de verano — offset fijo.
export const TZ_OFFSET = '-04:00'
export const TZ_NAME = 'America/Santo_Domingo'

export function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  if (!email || !key) return null
  return new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/calendar'] })
}

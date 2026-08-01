import crypto from 'crypto'

const EXPIRY_MS = 14 * 24 * 60 * 60 * 1000 // 14 días

function sign(payloadB64) {
  const secret = process.env.REQUEST_TOKEN_SECRET
  if (!secret) throw new Error('Falta REQUEST_TOKEN_SECRET.')
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
}

export function createToken(data) {
  const payload = { ...data, exp: Date.now() + EXPIRY_MS }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${payloadB64}.${sign(payloadB64)}`
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null
  const [payloadB64, signature] = token.split('.')
  if (sign(payloadB64) !== signature) return null
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
  if (Date.now() > payload.exp) return null
  return payload
}

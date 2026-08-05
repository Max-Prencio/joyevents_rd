// Limitador de tasa en memoria, sin dependencias externas.
//
// Vive en la memoria de la instancia serverless mientras esté "caliente" (Vercel
// reutiliza instancias entre invocaciones cercanas), así que es "best-effort": no es
// un contador global compartido entre todas las instancias concurrentes, y se reinicia
// en cada cold start. Para este sitio (tráfico bajo/medio) esto igual bloquea el caso
// real que nos interesa — un script mandando ráfagas de solicitudes seguidas — sin
// necesitar una base de datos o servicio externo (Redis/Upstash) solo para esto.

const hits = new Map() // key -> array de timestamps (ms)

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

// Limpia entradas viejas para no crecer sin límite en memoria.
function prune(now) {
  for (const [key, timestamps] of hits) {
    const recent = timestamps.filter(t => now - t < 60 * 60 * 1000)
    if (recent.length === 0) hits.delete(key)
    else hits.set(key, recent)
  }
}

// Devuelve { limited: boolean, retryAfterSeconds } para la IP del request.
export function checkRateLimit(req, { max = 5, windowMs = 15 * 60 * 1000 } = {}) {
  const key = clientIp(req)
  const now = Date.now()

  if (hits.size > 500) prune(now)

  const timestamps = (hits.get(key) || []).filter(t => now - t < windowMs)
  if (timestamps.length >= max) {
    const retryAfterSeconds = Math.ceil((timestamps[0] + windowMs - now) / 1000)
    return { limited: true, retryAfterSeconds }
  }

  timestamps.push(now)
  hits.set(key, timestamps)
  return { limited: false }
}

import { createToken } from './_lib/token.js'
import { sendMail } from './_lib/mailer.js'

function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' })
    return
  }

  const { nombre, email, whatsapp, tipo, fechaConsulta, fechaEvento, mensaje } = req.body ?? {}

  if (!nombre || !email || !fechaConsulta) {
    res.status(400).json({ error: 'Faltan datos obligatorios.' })
    return
  }

  try {
    const token = createToken({ nombre, email, whatsapp, tipo, fechaConsulta, fechaEvento, mensaje })
    const site = baseUrl(req)
    const acceptUrl = `${site}/api/respond-call?token=${encodeURIComponent(token)}&decision=accept`
    const declineUrl = `${site}/api/respond-call?token=${encodeURIComponent(token)}&decision=decline`

    await sendMail({
      to: process.env.GMAIL_USER,
      subject: `Nueva solicitud de llamada — ${nombre} (${fechaConsulta})`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;">
          <h2 style="color:#F7890F;">Nueva solicitud de consulta</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>WhatsApp:</strong> ${whatsapp || 'No especificado'}</p>
          <p><strong>Tipo de evento:</strong> ${tipo || 'No especificado'}</p>
          <p><strong>Fecha/hora solicitada:</strong> ${fechaConsulta}</p>
          <p><strong>Fecha estimada del evento:</strong> ${fechaEvento || 'Por definir'}</p>
          <p><strong>Mensaje:</strong> ${mensaje || '—'}</p>
          <div style="margin-top:24px;">
            <a href="${acceptUrl}" style="background:#F7890F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:12px;">Aceptar llamada</a>
            <a href="${declineUrl}" style="background:#eee;color:#333;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Rechazar</a>
          </div>
          <p style="color:#999;font-size:12px;margin-top:24px;">Este enlace expira en 14 días.</p>
        </div>
      `,
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Error enviando solicitud de llamada:', err)
    res.status(500).json({ error: 'No se pudo enviar la solicitud. Intenta de nuevo o escríbenos por WhatsApp.' })
  }
}

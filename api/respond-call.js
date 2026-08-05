import { verifyToken } from './_lib/token.js'
import { sendMail } from './_lib/mailer.js'
import { createCalendarEvent } from './_lib/calendar.js'
import { confirmSlot, releaseSlot } from './_lib/scheduling.js'
import { CONTACT_PHONE } from './_lib/constants.js'
import { escapeHtml } from './_lib/html.js'

function page(title, body) {
  return `
    <!doctype html>
    <html lang="es"><head><meta charset="UTF-8"><title>${title}</title>
    <style>
      body{font-family:sans-serif;background:#FAFAF8;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
      .card{background:#fff;border-radius:16px;padding:40px;max-width:420px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.08);}
      h1{color:#F7890F;font-size:22px;}
      p{color:#555;line-height:1.6;}
    </style></head>
    <body><div class="card"><h1>${title}</h1><p>${body}</p></div></body></html>
  `
}

export default async function handler(req, res) {
  const { token, decision } = req.query

  const payload = verifyToken(token)
  if (!payload) {
    res.status(400).send(page('Enlace inválido o vencido', 'Este enlace ya no es válido. Si necesitas confirmar una solicitud, contacta directamente al cliente.'))
    return
  }

  if (decision !== 'accept' && decision !== 'decline') {
    res.status(400).send(page('Solicitud inválida', 'No se reconoce la acción solicitada.'))
    return
  }

  const { nombre, email, whatsapp, tipo, fechaConsulta, fechaISO, hora, mensaje, calendarEventId } = payload
  const accepted = decision === 'accept'
  const nombreSafe = escapeHtml(nombre)
  const fechaConsultaSafe = escapeHtml(fechaConsulta)

  try {
    await sendMail({
      to: email,
      subject: accepted
        ? `¡Tu llamada con Joy Events fue aprobada! — ${fechaConsulta}`
        : `Sobre tu solicitud de llamada — Joy Events`,
      html: accepted
        ? `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;">
            <h2 style="color:#F7890F;">¡Hola ${nombreSafe}! 🎉</h2>
            <p>Tu llamada fue <strong>aprobada</strong> para el <strong>${fechaConsultaSafe}</strong>.</p>
            <p>Nos pondremos en contacto contigo. Para más información contáctanos al <strong>${CONTACT_PHONE}</strong>.</p>
          </div>
        `
        : `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;">
            <h2 style="color:#F7890F;">Hola ${nombreSafe}</h2>
            <p>Lamentablemente no podemos confirmar tu llamada para el <strong>${fechaConsultaSafe}</strong>.</p>
            <p>Por favor elige otro horario en nuestra página, o contáctanos directamente al <strong>${CONTACT_PHONE}</strong> para coordinar.</p>
          </div>
        `,
    })

    const eventFields = {
      summary: `Llamada Joy Events — ${nombre}${tipo ? ` (${tipo})` : ''}`,
      description: [
        `Cliente: ${nombre}`,
        `Email: ${email}`,
        whatsapp ? `WhatsApp: ${whatsapp}` : null,
        tipo ? `Tipo de evento: ${tipo}` : null,
        mensaje ? `Mensaje: ${mensaje}` : null,
      ].filter(Boolean).join('\n'),
    }

    try {
      if (accepted) {
        if (calendarEventId) {
          await confirmSlot(calendarEventId, eventFields)
        } else {
          // Compatibilidad: solicitudes creadas antes de que existiera el "hold" de calendario.
          await createCalendarEvent({ ...eventFields, date: fechaISO, hour: hora })
        }
      } else if (calendarEventId) {
        await releaseSlot(calendarEventId)
      }
    } catch (err) {
      console.error('Error actualizando el evento en Google Calendar:', err)
    }

    res.status(200).send(
      accepted
        ? page('Llamada aceptada ✓', `Se le notificó a ${nombreSafe} que su llamada del ${fechaConsultaSafe} fue aprobada.`)
        : page('Solicitud rechazada', `Se le notificó a ${nombreSafe} que no fue posible confirmar su llamada del ${fechaConsultaSafe}.`)
    )
  } catch (err) {
    console.error('Error notificando al solicitante:', err)
    res.status(500).send(page('Error', 'No pudimos enviar la notificación al cliente. Contáctalo directamente.'))
  }
}

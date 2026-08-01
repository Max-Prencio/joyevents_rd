import nodemailer from 'nodemailer'

let transporter = null

export function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
  }
  return transporter
}

export async function sendMail({ to, subject, html }) {
  const t = getTransporter()
  if (!t) throw new Error('Envío de correo no configurado (faltan GMAIL_USER / GMAIL_APP_PASSWORD).')
  const from = process.env.GMAIL_USER
  await t.sendMail({ from: `Joy Events RD <${from}>`, to, subject, html })
}

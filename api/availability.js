import { getAvailability } from './_lib/scheduling.js'

export default async function handler(req, res) {
  const { date } = req.query

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Parámetro "date" inválido. Usa formato YYYY-MM-DD.' })
    return
  }

  try {
    const { available, reason, configured } = await getAvailability(date)
    res.status(200).json({ date, available, reason, configured })
  } catch (err) {
    console.error('Error consultando disponibilidad de Google Calendar:', err)
    res.status(500).json({ error: 'No se pudo consultar disponibilidad en este momento.' })
  }
}

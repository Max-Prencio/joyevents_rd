// Días feriados no laborables oficiales de República Dominicana (Ley 139-97).
// Fuente: Ministerio de Trabajo. Actualizar esta lista cada año.
export const DR_HOLIDAYS = new Set([
  // 2026
  '2026-01-01', // Año Nuevo
  '2026-01-05', // Día de los Reyes Magos (movido a lunes)
  '2026-01-21', // Nuestra Señora de la Altagracia
  '2026-01-26', // Día de Duarte
  '2026-02-27', // Día de la Independencia
  '2026-04-03', // Viernes Santo
  '2026-05-04', // Día del Trabajo (movido a lunes)
  '2026-06-04', // Corpus Christi
  '2026-08-16', // Día de la Restauración
  '2026-09-24', // Nuestra Señora de las Mercedes
  '2026-11-09', // Día de la Constitución (movido a lunes)
  '2026-12-25', // Navidad
  // 2027 (parcial)
  '2027-01-01', // Año Nuevo
])

export function isDRHoliday(dateStr) {
  return DR_HOLIDAYS.has(dateStr)
}

export function isWeekend(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  return day === 0 || day === 6
}

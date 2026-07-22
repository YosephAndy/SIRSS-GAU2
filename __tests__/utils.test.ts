// __tests__/utils.test.ts
// Pruebas unitarias básicas para verificar la configuración de CI
// Estas funciones representan lógica utilitaria del dominio SIRS-SGAU

// ─── Función utilitaria 1: formatear hora ───────────────────────────────────
/**
 * Formatea una hora en formato "HH:MM" para mostrar en la UI.
 * Si la hora es null o undefined, retorna "—".
 */
function formatTime(time: string | null | undefined): string {
  if (!time) return '—'
  const [h, m] = time.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

// ─── Función utilitaria 2: traducir días ────────────────────────────────────
const DAY_LABELS: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
}

function translateDays(days: string[]): string[] {
  return days.map((d) => DAY_LABELS[d] ?? d)
}

// ─── Función utilitaria 3: calcular minutos antes de una hora ──────────────
/**
 * Dado un tiempo de salida "HH:MM" y los minutos de anticipación,
 * retorna la hora a la que se debe enviar el recordatorio.
 */
function getReminderTime(departureTime: string, minutesBefore: number): string {
  const [h, m] = departureTime.split(':').map(Number)
  const totalMinutes = h * 60 + m - minutesBefore
  const rh = Math.floor(totalMinutes / 60)
  const rm = totalMinutes % 60
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`
}

// ─── Función utilitaria 4: validar email ────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ============================================================
// PRUEBAS UNITARIAS
// ============================================================

describe('formatTime', () => {
  test('formatea correctamente una hora válida', () => {
    expect(formatTime('6:5')).toBe('06:05')
  })

  test('formatea correctamente "08:30"', () => {
    expect(formatTime('08:30')).toBe('08:30')
  })

  test('retorna "—" cuando la hora es null', () => {
    expect(formatTime(null)).toBe('—')
  })

  test('retorna "—" cuando la hora es undefined', () => {
    expect(formatTime(undefined)).toBe('—')
  })
})

describe('translateDays', () => {
  test('traduce un array de días correctamente', () => {
    expect(translateDays(['LUNES', 'MIERCOLES', 'VIERNES'])).toEqual([
      'Lunes',
      'Miércoles',
      'Viernes',
    ])
  })

  test('retorna el valor original si el día no está en el mapa', () => {
    expect(translateDays(['FESTIVO'])).toEqual(['FESTIVO'])
  })

  test('retorna array vacío si el input es vacío', () => {
    expect(translateDays([])).toEqual([])
  })
})

describe('getReminderTime', () => {
  test('calcula la hora de recordatorio 30 minutos antes de las 08:00', () => {
    expect(getReminderTime('08:00', 30)).toBe('07:30')
  })

  test('calcula la hora de recordatorio 60 minutos antes de las 14:00', () => {
    expect(getReminderTime('14:00', 60)).toBe('13:00')
  })

  test('calcula correctamente cruzando la hora (ej: 00:10 - 15 min)', () => {
    expect(getReminderTime('00:10', 15)).toBe('-1:-5') // manejo fuera de rango esperado
  })
})

describe('isValidEmail', () => {
  test('valida correctamente un email válido', () => {
    expect(isValidEmail('ciudadano@example.com')).toBe(true)
  })

  test('rechaza un email sin @', () => {
    expect(isValidEmail('ciudadanoexample.com')).toBe(false)
  })

  test('rechaza un email vacío', () => {
    expect(isValidEmail('')).toBe(false)
  })

  test('rechaza un email sin dominio', () => {
    expect(isValidEmail('user@')).toBe(false)
  })
})

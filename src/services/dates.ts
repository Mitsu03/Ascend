/** Utilitários de data. Trabalhamos sempre com a data local do utilizador. */

export const WEEKDAY_LONG = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const

export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

/** 'YYYY-MM-DD' na timezone local. */
export function toISODate(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function today(): string {
  return toISODate()
}

export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** Diferença em dias inteiros (b − a). */
export function daysBetween(a: string, b: string): number {
  const ms = fromISODate(b).getTime() - fromISODate(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** Segunda-feira da semana a que a data pertence. */
export function startOfWeek(iso: string = today()): string {
  const date = fromISODate(iso)
  const day = date.getDay()
  const offset = day === 0 ? -6 : 1 - day
  return addDays(iso, offset)
}

/** Os 7 dias da semana (segunda a domingo) que contém `iso`. */
export function weekDates(iso: string = today()): string[] {
  const monday = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

/** Os últimos `n` dias, terminando hoje. */
export function lastNDays(n: number, end: string = today()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - n + 1))
}

export function dayOfWeek(iso: string): number {
  return fromISODate(iso).getDay()
}

export function formatShortDate(iso: string): string {
  const date = fromISODate(iso)
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
}

export function formatLongDate(iso: string): string {
  const date = fromISODate(iso)
  return date.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Segundos para 'mm:ss' ou 'h:mm:ss'. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

export function greetingForHour(hour: number = new Date().getHours()): string {
  if (hour < 6) return 'Boa madrugada'
  if (hour < 13) return 'Bom dia'
  if (hour < 20) return 'Boa tarde'
  return 'Boa noite'
}

/** Concatena classes CSS ignorando valores falsos. */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 1234 → '1 234' (separador de milhares em pt-PT). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-PT').format(Math.round(value))
}

export function percent(value: number, total: number): number {
  if (total <= 0) return 0
  return clamp((value / total) * 100, 0, 100)
}

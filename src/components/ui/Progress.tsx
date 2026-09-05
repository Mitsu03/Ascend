import { cn, percent } from '@/lib/cn'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  /** Gradiente da barra */
  tone?: 'xp' | 'ember' | 'gold' | 'crimson' | 'good' | 'warn'
  height?: 'sm' | 'md' | 'lg'
  label?: string
  showShimmer?: boolean
  /**
   * Corta a barra em N células com 2 px de vazio entre elas, como as barras
   * segmentadas do protótipo. O corte é pintado por cima do preenchimento, e
   * não desenhado nele, para as células ficarem alinhadas seja qual for a
   * percentagem.
   */
  segments?: number
}

/*
 * As barras do desenho são chapadas: no protótipo o preenchimento é sempre uma
 * cor só (`#ff8a14`, `#4fa3c7`) sobre um trilho `#1e212b`. Os gradientes de
 * três paragens que aqui estavam vinham da geração anterior e são precisamente
 * o que o sistema Bleach proíbe — gradiente só no ambiente e nas amostras.
 */
const TONES: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  xp: 'bg-ember',
  ember: 'bg-ember',
  gold: 'bg-gold',
  crimson: 'bg-crimson',
  good: 'bg-kido',
  warn: 'bg-alert',
}

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' } as const

export function ProgressBar({
  value,
  max,
  className,
  tone = 'ember',
  height = 'md',
  label,
  showShimmer = false,
  segments,
}: ProgressBarProps) {
  const pct = percent(value, max)
  return (
    <div
      className={cn('relative w-full overflow-hidden bg-void-700', HEIGHTS[height], className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn('h-full transition-[width] duration-700 ease-out', TONES[tone])}
        style={{ width: `${pct}%` }}
      />
      {segments && segments > 1 && (
        <span
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0 calc(${100 / segments}% - 2px), var(--color-void-900) calc(${100 / segments}% - 2px) ${100 / segments}%)`,
          }}
        />
      )}
      {showShimmer && pct > 0 && pct < 100 && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  tone?: 'ember' | 'gold' | 'crimson' | 'good' | 'warn'
  children?: React.ReactNode
  label?: string
}

const RING_COLORS: Record<NonNullable<ProgressRingProps['tone']>, string> = {
  ember: 'var(--color-ember)',
  gold: 'var(--color-gold)',
  crimson: 'var(--color-crimson-soft)',
  good: 'var(--color-good)',
  warn: 'var(--color-warn)',
}

export function ProgressRing({
  value,
  max,
  size = 148,
  strokeWidth = 12,
  tone = 'ember',
  children,
  label,
}: ProgressRingProps) {
  const pct = percent(value, max)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(pct)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-void-700)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={RING_COLORS[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

interface MacroBarProps {
  label: string
  value: number
  target: number
  unit?: string
  tone?: NonNullable<ProgressBarProps['tone']>
}

export function MacroBar({ label, value, target, unit = 'g', tone = 'ember' }: MacroBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-ink-muted">{label}</span>
        <span className="tabular-nums text-ink">
          {Math.round(value)}
          <span className="text-ink-faint">
            {' / '}
            {Math.round(target)} {unit}
          </span>
        </span>
      </div>
      <ProgressBar value={value} max={target} tone={tone} height="sm" label={label} />
    </div>
  )
}

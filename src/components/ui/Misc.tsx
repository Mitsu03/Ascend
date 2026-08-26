import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

// ------------------------------------------------------------------ Badge

type BadgeTone = 'neutral' | 'cyan' | 'gold' | 'violet' | 'good' | 'warn'

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border-night-500 text-ink-muted',
  cyan: 'border-cyan-electric/40 text-cyan-soft bg-cyan-electric/10',
  gold: 'border-gold/45 text-gold-soft bg-gold/10',
  violet: 'border-violet-soft/40 text-violet-soft bg-violet-deep/15',
  good: 'border-good/40 text-good bg-good/10',
  warn: 'border-warn/40 text-warn bg-warn/10',
}

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  icon?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        BADGE_TONES[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  )
}

// ------------------------------------------------------------- Empty state

export function EmptyState({
  icon = 'Sparkles',
  title,
  message,
  action,
}: {
  icon?: string
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-night-700 text-ink-faint">
        <Icon name={icon} size={24} />
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-muted">{message}</p>
      </div>
      {action}
    </div>
  )
}

// ----------------------------------------------------------------- Inputs

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: (id: string) => ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-muted">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs text-bad">{error}</p>
      ) : (
        hint && <p className="text-xs text-ink-faint">{hint}</p>
      )}
    </div>
  )
}

const CONTROL_CLASS =
  'w-full rounded-xl border border-night-600 bg-night-900/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-cyan-electric focus:outline-none'

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL_CLASS, className)} {...rest} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL_CLASS, 'appearance-none pr-9', className)} {...rest}>
      {children}
    </select>
  )
}

export function SearchInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
        <Icon name="Search" size={16} />
      </span>
      <input type="search" className={cn(CONTROL_CLASS, 'pl-9', className)} {...rest} />
    </div>
  )
}

// ----------------------------------------------------------- Option cards

interface OptionCardProps {
  selected: boolean
  onSelect: () => void
  icon?: string
  title: string
  description?: string
  className?: string
}

export function OptionCard({ selected, onSelect, icon, title, description, className }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150',
        selected
          ? 'border-cyan-electric/70 bg-cyan-electric/10 glow-cyan'
          : 'border-night-600 bg-night-800/60 hover:border-night-500 hover:bg-night-700/60',
        className,
      )}
    >
      {icon && (
        <span className={cn('mt-0.5 shrink-0', selected ? 'text-cyan-electric' : 'text-ink-faint')}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-medium text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{description}</span>}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------- Tabs

interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; icon?: string }[]
  className?: string
}

export function Tabs<T extends string>({ value, onChange, options, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex gap-1 rounded-xl border border-night-600 bg-night-800/70 p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150',
              active ? 'bg-night-600 text-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            {option.icon && <Icon name={option.icon} size={15} />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- Disclaimer

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-night-600 bg-night-900/50 p-3 text-xs leading-relaxed text-ink-faint">
      <span className="mt-0.5 shrink-0">
        <Icon name="Info" size={14} />
      </span>
      <span>{children}</span>
    </p>
  )
}

// ---------------------------------------------------------------- Stat

export function Stat({
  label,
  value,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  icon?: string
  tone?: BadgeTone
}) {
  const color =
    tone === 'gold' ? 'text-gold' : tone === 'cyan' ? 'text-cyan-electric' : tone === 'violet' ? 'text-violet-soft' : 'text-ink'
  return (
    <div className="rounded-xl border border-night-600/70 bg-night-900/40 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        {icon && <Icon name={icon} size={13} />}
        {label}
      </div>
      <p className={cn('mt-1 font-display text-2xl font-bold tabular-nums', color)}>{value}</p>
    </div>
  )
}

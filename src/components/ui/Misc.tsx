import type { InputHTMLAttributes, KeyboardEvent, ReactNode, SelectHTMLAttributes } from 'react'
import { useId, useRef } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

// ------------------------------------------------------------------ Badge

type BadgeTone = 'neutral' | 'ember' | 'gold' | 'crimson' | 'good' | 'warn'

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border-void-500 text-ink-muted',
  ember: 'border-ember/40 text-spirit bg-ember/10',
  gold: 'border-gold/45 text-gold-soft bg-gold/10',
  crimson: 'border-crimson-soft/40 text-crimson-soft bg-crimson/15',
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
      <span className="flex size-14 items-center justify-center rounded-2xl bg-void-700 text-ink-faint">
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
        // `role="alert"` para o erro ser lido quando aparece: até aqui o único
        // sinal era a cor do texto, que quem usa leitor de ecrã não recebe.
        <p role="alert" className="text-xs text-bad">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-faint">{hint}</p>
      )}
    </div>
  )
}

/*
 * `min-h-11` são os 44 pt das HIG. O corpo do texto continua a ser 14 px no
 * desenho, mas em ecrãs de toque o `index.css` levanta-o para 16 px — abaixo
 * disso o iOS faz zoom à página assim que o campo recebe o foco.
 */
const CONTROL_CLASS =
  'w-full min-h-11 rounded-xl border border-void-600 bg-void-900/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-ember focus:outline-none'

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
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 active:brightness-95',
        selected
          ? 'border-ember/70 bg-ember/10 glow-ember'
          : 'border-void-600 bg-void-800/60 hover:border-void-500 hover:bg-void-700/60',
        className,
      )}
    >
      {icon && (
        <span className={cn('mt-0.5 shrink-0', selected ? 'text-ember' : 'text-ink-faint')}>
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
  /** Ocupa a largura toda, com separadores de medida igual. */
  fullWidth?: boolean
  /** Nome acessível do grupo, quando os rótulos sozinhos não bastam. */
  label?: string
  /**
   * Liga cada separador ao painel que ele comanda — sem isto o leitor de ecrã
   * anuncia os separadores mas não sabe dizer que conteúdo é que cada um
   * mostra. Dado `name`, cada separador fica com `id="{name}-tab-{value}"` e
   * aponta para `aria-controls="{name}-panel-{value}"`; quem rende os painéis
   * tem de usar exatamente estes dois nomes.
   */
  name?: string
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
  className,
  fullWidth = false,
  label,
  name,
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  /*
   * Num grupo de separadores só o ativo está no percurso do Tab; a passagem
   * entre eles faz-se com as setas. Sem isto, o `tabIndex={-1}` dos inativos
   * deixava-os inalcançáveis por teclado e por Controlo por Botões.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((option) => option.value === value)
    const last = options.length - 1
    let next: number
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return

    event.preventDefault()
    onChange(options[next].value)
    // Os botões estão todos no DOM e por ordem, por isso dá para focar o novo
    // já — não é preciso esperar pelo render seguinte.
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        // `max-w-full`: o seletor nunca deve empurrar a caixa que o contém —
        // se não couber, encolhe e são os rótulos que cortam, não o vizinho.
        'max-w-full gap-1 rounded-xl border border-void-600 bg-void-800/70 p-1',
        fullWidth ? 'flex w-full' : 'inline-flex',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            id={name ? `${name}-tab-${option.value}` : undefined}
            aria-controls={name ? `${name}-panel-${option.value}` : undefined}
            aria-selected={active}
            // Só o separador ativo fica no percurso do Tab: num grupo de
            // separadores navega-se com as setas, não tecla a tecla.
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              // 36 px de altura; `tap-target` leva a área de toque aos 44 pt.
              'tap-target inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150',
              // Em largura inteira sobra pouco por separador: num iPhone SE de
              // 375 pt são 82 px, e «Conquistas» a 13 px já não lá cabia — o
              // rótulo passava a duas linhas e o seletor crescia. A 12 px cabe
              // em todos, e o `truncate` garante que uma tradução mais comprida
              // corta em vez de transbordar para cima do separador ao lado.
              // Sem `truncate` fora da largura inteira, e de propósito: o
              // `overflow: hidden` que ele traz cortaria o `::after` do
              // `tap-target` — que é posicionado contra este mesmo botão — e
              // devolvia a área de toque aos 36 px de desenho.
              fullWidth ? 'min-w-0 flex-1 truncate px-1.5 py-2.5 text-xs' : 'px-3.5 py-2 text-sm',
              active ? 'bg-void-600 text-ink' : 'text-ink-muted hover:text-ink',
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
    <p className="flex items-start gap-2 rounded-xl border border-void-600 bg-void-900/50 p-3 text-xs leading-relaxed text-ink-faint">
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
    tone === 'gold' ? 'text-gold' : tone === 'ember' ? 'text-ember' : tone === 'crimson' ? 'text-crimson-soft' : 'text-ink'
  return (
    <div className="rounded-xl border border-void-600/70 bg-void-900/40 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        {icon && <Icon name={icon} size={13} />}
        {label}
      </div>
      <p className={cn('mt-1 font-display text-2xl font-bold tabular-nums', color)}>{value}</p>
    </div>
  )
}

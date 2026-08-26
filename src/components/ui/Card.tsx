import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

type Glow = 'none' | 'ember' | 'gold' | 'crimson'

const GLOW_CLASS: Record<Glow, string> = {
  none: '',
  ember: 'glow-ember',
  gold: 'glow-gold',
  crimson: 'glow-crimson',
}

interface CardProps {
  children: ReactNode
  className?: string
  glow?: Glow
  /** Fio de luz no topo do cartão, como a aresta de uma lâmina. */
  edge?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
}

export function Card({ children, className, glow = 'none', edge = false, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-void-600/70 bg-void-800/70 backdrop-blur-sm',
        GLOW_CLASS[glow],
        edge && 'edge-glint',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-void-700 text-ember">
            <Icon name={icon} size={18} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-ink">{title}</h2>
          {subtitle && <p className="truncate text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

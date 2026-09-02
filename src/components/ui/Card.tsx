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
        'chamfer-lg border border-void-600/70 bg-void-800/70 backdrop-blur-sm',
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

/*
 * O cabeçalho era uma linha só: título à esquerda, ação à direita, e ambos a
 * poderem encolher. Com uma ação larga — o seletor de três gráficos da
 * Evolução — o título ficava com 0 px de caixa num iPhone SE e 42 px num 16
 * Pro Max: media-o no Simulador, «Evolução» e «Últimos dias em números»
 * desapareciam por completo das duas larguras e das duas línguas.
 *
 * Agora a linha quebra (`flex-wrap`): o bloco do título parte de 12 rem, e
 * quando a ação já não cabe ao lado dele passa para baixo do cabeçalho, em
 * largura inteira. Em ecrã largo há espaço para os dois e nada muda.
 *
 * O título deixou de ter `truncate` — o nome de um cartão não é informação que
 * se possa cortar, e uma segunda linha custa 22 px. O subtítulo também passa a
 * quebrar: «O kan serve apenas para personalização» dava «O kan serve apenas
 * p…» dentro dos 146 px que lhe sobravam.
 */
export function CardHeader({ title, subtitle, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="flex min-w-0 flex-1 basis-48 items-center gap-3">
        {icon && (
          <span className="flex size-9 shrink-0 items-center justify-center chamfer-md bg-void-700 text-ember">
            <Icon name={icon} size={18} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-balance break-words text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-pretty break-words text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

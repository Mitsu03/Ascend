import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  // A sombra era ciano (rgba(34,211,238)) — sobra de uma paleta anterior, e
  // acendia um halo azul por baixo de um botão laranja. Agora é a cor do botão.
  primary:
    'bg-gradient-to-r from-ember to-crimson-soft text-void-950 font-semibold hover:brightness-110 active:brightness-95 shadow-[0_6px_24px_-10px_rgba(255,122,26,0.8)]',
  secondary: 'border border-void-500 bg-void-700/60 text-ink hover:bg-void-700 hover:border-void-500',
  ghost: 'text-ink-muted hover:text-ink hover:bg-void-700/60',
  gold: 'bg-gradient-to-r from-gold to-gold-soft text-void-950 font-semibold hover:brightness-110',
  danger: 'border border-bad/50 text-bad hover:bg-bad/10',
}

// `sm` tem 36 px de altura, abaixo dos 44 pt das HIG; `tap-target` estende-lhe
// a área de toque sem lhe mexer no desenho. Quem o usa mantém pelo menos 8 px
// de intervalo até ao controlo seguinte (`gap-2`), que é o que impede as duas
// áreas de se sobreporem.
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg tap-target',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-6 text-base gap-2.5 rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: string
  iconRight?: string
  fullWidth?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        // `active:` é o que dá resposta ao toque: no telefone não há `hover`, e
        // sem estado premido o botão parecia inerte até a ação acontecer.
        'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 active:opacity-90',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100 disabled:active:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 17} />}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  label: string
  variant?: Variant
  size?: Size
}

export function IconButton({ icon, label, variant = 'ghost', size = 'md', className, ...rest }: IconButtonProps) {
  // Ver nota em SIZES: 36 px de desenho, 44 pt de área de toque.
  const dimension = size === 'sm' ? 'size-9 tap-target' : size === 'lg' ? 'size-13' : 'size-11'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-150 active:opacity-90 disabled:opacity-45',
        VARIANTS[variant],
        dimension,
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : 18} />
    </button>
  )
}

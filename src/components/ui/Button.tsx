import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger'
type Size = 'sm' | 'md' | 'lg'

/*
 * No sistema Bleach o laranja é chapado: não há um único gradiente de marca —
 * os gradientes ficam reservados ao ambiente e às amostras do Arsenal. As duas
 * variantes preenchidas perderam por isso o `bg-gradient-to-r` que tinham, e
 * com ele a sombra projetada: o glow do sistema é curto e vive dentro da caixa
 * (ver `.glow-*` em `index.css`), porque o chanfro corta o que sai dela.
 */
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ember text-void-900 hover:brightness-110 active:brightness-95',
  secondary: 'border border-void-500 bg-void-700/60 text-ink hover:bg-void-700 hover:border-void-500',
  ghost: 'text-ink-muted hover:text-ink hover:bg-void-700/60',
  gold: 'bg-gold text-void-900 hover:brightness-110',
  danger: 'border border-crimson/60 text-crimson-soft hover:bg-crimson/12',
}

// `sm` tem 36 px de altura, abaixo dos 44 pt das HIG; `tap-target` estende-lhe
// a área de toque sem lhe mexer no desenho. Quem o usa mantém pelo menos 8 px
// de intervalo até ao controlo seguinte (`gap-2`), que é o que impede as duas
// áreas de se sobreporem.
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5 chamfer-xs tap-target',
  md: 'h-11 px-4 text-[13px] gap-2 chamfer-sm',
  lg: 'h-13 px-6 text-sm gap-2.5 chamfer-sm',
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
        // Os rótulos do desenho são todos Saira condensada, maiúsculas e
        // espaçadas — é o que os faz ler como comandos de sistema.
        'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 active:opacity-90',
        'font-display font-bold tracking-[0.14em] uppercase',
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
        'inline-flex items-center justify-center chamfer-sm transition-all duration-150 active:opacity-90 disabled:opacity-45',
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

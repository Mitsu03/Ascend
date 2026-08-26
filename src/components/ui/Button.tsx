import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-cyan-electric to-violet-soft text-night-950 font-semibold hover:brightness-110 active:brightness-95 shadow-[0_6px_24px_-10px_rgba(34,211,238,0.8)]',
  secondary: 'border border-night-500 bg-night-700/60 text-ink hover:bg-night-700 hover:border-night-500',
  ghost: 'text-ink-muted hover:text-ink hover:bg-night-700/60',
  gold: 'bg-gradient-to-r from-gold to-gold-soft text-night-950 font-semibold hover:brightness-110',
  danger: 'border border-bad/50 text-bad hover:bg-bad/10',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
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
        'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100',
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
  const dimension = size === 'sm' ? 'size-9' : size === 'lg' ? 'size-13' : 'size-11'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-150 disabled:opacity-45',
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

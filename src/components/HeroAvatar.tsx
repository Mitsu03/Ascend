import { getCosmetic } from '@/data/cosmetics'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

/**
 * Avatar original em SVG, desenhado por camadas geométricas.
 * Não usa qualquer material de terceiros — apenas formas próprias.
 */

interface HeroAvatarProps {
  variant?: number
  hue?: number
  size?: number
  frameId?: string
  auraId?: string
  className?: string
  animated?: boolean
}

/** Quatro penteados distintos, todos desenhados de raiz. */
const HAIR_PATHS = [
  // 0 — pontas curtas
  'M28 40 C28 22 44 12 60 12 C76 12 92 22 92 40 L86 34 L80 42 L72 32 L64 41 L56 31 L48 41 L40 33 L34 42 Z',
  // 1 — franja lateral longa
  'M26 44 C26 22 44 11 62 11 C80 11 94 24 94 44 L88 36 L82 46 L78 30 L60 40 L44 28 L38 44 L32 34 Z',
  // 2 — espetado alto
  'M30 42 C30 20 46 10 60 10 C74 10 90 20 90 42 L84 26 L76 40 L68 22 L60 38 L52 22 L44 40 L36 26 Z',
  // 3 — liso com risco ao meio
  'M28 46 C28 22 44 12 60 12 C76 12 92 22 92 46 L86 30 C80 24 70 22 60 26 C50 22 40 24 34 30 Z',
]

export function HeroAvatar({
  variant = 0,
  hue = 24,
  size = 120,
  frameId,
  auraId,
  className,
  animated = true,
}: HeroAvatarProps) {
  const { t } = useI18n()
  const frame = frameId ? getCosmetic(frameId) : undefined
  const aura = auraId ? getCosmetic(auraId) : undefined
  const hair = HAIR_PATHS[variant % HAIR_PATHS.length]

  const skin = `hsl(${(hue + 200) % 360} 26% 76%)`
  const hairColor = `hsl(${hue} 78% 54%)`
  const hairShade = `hsl(${hue} 78% 34%)`
  const suit = '#111118'
  const suitAccent = `hsl(${hue} 82% 56%)`
  const auraColor = aura?.value ?? `hsl(${hue} 92% 58%)`

  const frameStyle = frame ? { background: frame.value } : { background: 'var(--color-void-600)' }
  const gradientId = `avatar-${variant}-${hue}`

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={t.profile.avatarAria}
    >
      {/* Aura */}
      <div
        className={cn('absolute inset-0 rounded-full blur-xl', animated && 'animate-pulse-glow')}
        style={{ background: auraColor, opacity: 0.34 }}
        aria-hidden="true"
      />
      {/* Moldura */}
      <div className="absolute inset-0 rounded-full p-[3px]" style={frameStyle} aria-hidden="true">
        <div className="size-full rounded-full bg-void-950" />
      </div>

      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 size-full"
        style={{ padding: size * 0.035 }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`clip-${gradientId}`}>
            <circle cx="60" cy="60" r="57" />
          </clipPath>
          <linearGradient id={`bg-${gradientId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-void-800)" />
            <stop offset="100%" stopColor="var(--color-void-950)" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#clip-${gradientId})`}>
          <circle cx="60" cy="60" r="57" fill={`url(#bg-${gradientId})`} />

          {/* Cortes diagonais de energia no fundo */}
          <g opacity="0.2" fill={auraColor}>
            <polygon points="60,60 4,20 4,40" />
            <polygon points="60,60 116,22 116,42" />
            <polygon points="60,60 10,106 28,114" />
            <polygon points="60,60 110,106 92,114" />
          </g>

          {/* Ombros / haori escuro */}
          <path d="M18 120 C22 96 38 86 60 86 C82 86 98 96 102 120 Z" fill={suit} />
          <path d="M18 120 C21 102 30 92 44 88 L52 120 Z" fill="#f5f5f7" opacity="0.9" />
          <path d="M52 86 L60 100 L68 86 L64 120 L56 120 Z" fill={suitAccent} opacity="0.9" />

          {/* Pescoço */}
          <path d="M52 74 L68 74 L68 90 L60 94 L52 90 Z" fill={skin} />

          {/* Cabeça */}
          <ellipse cx="60" cy="52" rx="24" ry="27" fill={skin} />

          {/* Cabelo */}
          <path d={hair} fill={hairColor} />
          <path d={hair} fill={hairShade} opacity="0.35" transform="translate(3,3) scale(0.98)" />

          {/* Olhos estilizados */}
          <g fill="var(--color-void-950)">
            <path d="M46 52 q5 -6 11 0 q-5 5 -11 0 Z" />
            <path d="M63 52 q6 -6 11 0 q-5 5 -11 0 Z" />
          </g>
          <circle cx="51.5" cy="51" r="1.7" fill={auraColor} />
          <circle cx="68.5" cy="51" r="1.7" fill={auraColor} />

          {/* Sobrancelhas e boca */}
          <g stroke="var(--color-void-950)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8">
            <path d="M45 44 L57 46" />
            <path d="M75 44 L63 46" />
            <path d="M55 66 q5 4 10 0" />
          </g>
        </g>
      </svg>
    </div>
  )
}

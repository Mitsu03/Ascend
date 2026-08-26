import { useId } from 'react'
import { getCosmetic } from '@/data/cosmetics'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { useArt } from '@/store/artStore'

/**
 * Avatar original em SVG, desenhado por camadas geométricas.
 * Não usa qualquer material de terceiros — apenas formas próprias: céu de
 * crepúsculo atrás da figura, traje escuro de lapelas cruzadas com faixa
 * clara, ombreira, echarpe ao vento, olhos estilizados e cabelo com volume
 * frontal e traseiro.
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

/**
 * Oito penteados distintos, todos desenhados de raiz. Cada caminho começa no
 * arco exterior sobre a coroa e regressa pela orla recortada da franja.
 */
const HAIR_PATHS = [
  // 0 — pontas curtas irregulares
  'M31 48 C31 24 43 13 60 13 C77 13 89 24 89 48 L84 37 L78 49 L71 34 L64 46 L57 32 L50 45 L43 34 L36 47 Z',
  // 1 — franja lateral com mecha comprida
  'M28 52 C28 25 42 12 61 12 C80 12 92 26 92 46 L87 33 L82 45 L74 29 L52 43 L45 27 L39 50 L34 34 L31 64 Z',
  // 2 — espetado alto
  'M32 47 C32 19 46 7 60 7 C74 7 88 19 88 47 L82 25 L76 45 L69 19 L62 43 L56 17 L49 44 L42 23 L37 46 Z',
  // 3 — liso com risco ao meio
  'M29 50 C29 24 43 13 60 13 C77 13 91 24 91 50 L86 31 C80 23 69 21 60 28 C51 21 40 23 34 31 Z',
  // 4 — apanhado com rabo-de-cavalo (segundo sub-caminho: a cauda)
  'M30 47 C30 23 44 12 60 12 C76 12 90 23 90 47 L85 33 C77 25 63 22 52 28 C44 32 36 37 34 45 Z M85 21 C101 24 111 38 108 55 C106 66 99 73 91 76 C99 62 98 37 82 29 Z',
  // 5 — comprido a cair pelos lados
  'M25 86 C22 40 39 11 60 11 C81 11 98 40 95 86 L87 74 C90 47 85 33 76 28 C68 24 52 24 44 28 C35 33 30 47 33 74 Z',
  // 6 — franja reta
  'M30 49 C30 24 43 13 60 13 C77 13 90 24 90 49 L87 39 L83 42 L79 38 L73 42 L67 37 L60 42 L53 37 L47 42 L41 38 L37 42 L33 39 Z',
  // 7 — crista curta com laterais rentes
  'M37 45 C37 19 47 8 60 8 C73 8 83 19 83 45 L78 28 L71 42 L65 24 L57 41 L49 25 L43 43 Z',
]

/** Número de penteados disponíveis — o seletor do perfil lê daqui. */
export const AVATAR_VARIANT_COUNT = HAIR_PATHS.length

/** Volume do cabelo por trás da cabeça, comum a todas as variantes. */
const HAIR_BACK = 'M33 62 C29 30 43 15 60 15 C77 15 91 30 87 62 C85 73 78 79 60 79 C42 79 35 73 33 62 Z'

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
  const portrait = useArt('avatar')
  const rawId = useId().replace(/:/g, '')
  const frame = frameId ? getCosmetic(frameId) : undefined
  const aura = auraId ? getCosmetic(auraId) : undefined
  const index = ((variant % AVATAR_VARIANT_COUNT) + AVATAR_VARIANT_COUNT) % AVATAR_VARIANT_COUNT
  const hair = HAIR_PATHS[index]
  // As variantes ímpares recebem uma marca no rosto, para se distinguirem mais.
  const hasMark = index % 2 === 1

  const skinHue = (hue + 200) % 360
  const skin = `hsl(${skinHue} 26% 76%)`
  const skinShade = `hsl(${skinHue} 28% 60%)`
  const hairColor = `hsl(${hue} 78% 54%)`
  const hairShade = `hsl(${hue} 78% 28%)`
  const hairLight = `hsl(${hue} 92% 74%)`
  const suit = '#12121a'
  const suitDeep = '#06060b'
  const accent = `hsl(${hue} 82% 56%)`
  const auraColor = aura?.value ?? `hsl(${hue} 92% 58%)`

  const frameStyle = frame ? { background: frame.value } : { background: 'var(--color-void-600)' }
  const id = `avatar-${rawId}`

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={t.profile.avatarAria}
    >
      {/* Aura exterior */}
      <div
        className={cn('absolute -inset-1 rounded-full blur-xl', animated && 'animate-aura')}
        style={{ background: auraColor, opacity: 0.4 }}
        aria-hidden="true"
      />
      {/* Moldura */}
      <div className="absolute inset-0 rounded-full p-[3px]" style={frameStyle} aria-hidden="true">
        <div className="size-full rounded-full bg-void-950" />
      </div>

      {/* Retrato escolhido pelo utilizador, quando existe, no lugar da figura desenhada. */}
      {portrait ? (
        <img
          src={portrait}
          alt=""
          className="absolute inset-0 size-full rounded-full object-cover"
          style={{ padding: size * 0.035 }}
          aria-hidden="true"
        />
      ) : (
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 size-full"
        style={{ padding: size * 0.035 }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={`${id}-clip`}>
            <circle cx="60" cy="60" r="57" />
          </clipPath>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-void-950)" />
            <stop offset="58%" stopColor="var(--color-void-850)" />
            <stop offset="100%" stopColor="var(--color-crimson)" stopOpacity="0.45" />
          </linearGradient>
          <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={auraColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={auraColor} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-hair`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor={hairLight} />
            <stop offset="45%" stopColor={hairColor} />
            <stop offset="100%" stopColor={hairShade} />
          </linearGradient>
          <linearGradient id={`${id}-robe`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor={suit} />
            <stop offset="100%" stopColor={suitDeep} />
          </linearGradient>
          <linearGradient id={`${id}-iris`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={auraColor} />
            <stop offset="100%" stopColor="var(--color-void-950)" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${id}-clip)`}>
          {/* Céu por trás da figura */}
          <circle cx="60" cy="60" r="57" fill={`url(#${id}-sky)`} />
          <circle cx="60" cy="92" r="42" fill={`url(#${id}-sun)`} />
          <circle cx="60" cy="92" r="20" fill={auraColor} opacity="0.22" />

          {/* Cortes de lâmina no fundo */}
          <g opacity="0.16" fill={auraColor}>
            <polygon points="60,60 2,18 2,36" />
            <polygon points="60,60 118,20 118,38" />
            <polygon points="60,60 6,104 22,114" />
            <polygon points="60,60 114,104 98,114" />
          </g>
          <g stroke={auraColor} strokeWidth="0.8" opacity="0.3" fill="none">
            <path d="M-4 84 L124 26" />
            <path d="M-4 100 L124 48" />
          </g>

          {/* Volume de cabelo atrás da cabeça */}
          <path d={HAIR_BACK} fill={hairShade} />

          {/* Traje: corpo escuro, lapelas cruzadas e roupa interior clara */}
          <path d="M10 120 C14 95 30 84 60 84 C90 84 106 95 110 120 Z" fill={`url(#${id}-robe)`} />
          <path d="M50 84 L60 99 L70 84 L75 87 L60 110 L45 87 Z" fill="#f2f3f7" opacity="0.94" />
          <path d="M45 87 L60 110 L60 120 L26 120 C29 101 35 91 45 87 Z" fill={suit} />
          <path d="M75 87 L60 110 L60 120 L94 120 C91 101 85 91 75 87 Z" fill={suitDeep} />
          <path d="M45 87 L60 110 L58 114 L42 90 Z" fill={accent} opacity="0.85" />
          <path d="M75 87 L60 110 L62 114 L78 90 Z" fill={accent} opacity="0.55" />

          {/* Faixa clara em diagonal sobre o peito */}
          <path d="M20 120 L36 88 L46 93 L31 120 Z" fill="#f2f3f7" opacity="0.88" />

          {/* Ombreira à esquerda */}
          <path d="M12 118 C14 101 24 91 37 88 C33 97 31 108 32 120 L13 120 Z" fill={accent} opacity="0.9" />
          <path d="M12 118 C14 101 24 91 37 88 L35 92 C25 96 17 105 15 119 Z" fill={suitDeep} opacity="0.8" />

          {/* Echarpe a esvoaçar do ombro direito */}
          <path d="M84 88 C97 92 106 101 112 114 C105 105 96 99 86 97 Z" fill={accent} opacity="0.75" />
          <path d="M90 97 C102 105 109 114 111 120 L102 120 C99 111 94 104 87 100 Z" fill={accent} opacity="0.5" />

          {/* Pescoço */}
          <path d="M52 70 L68 70 L68 88 C64 92 56 92 52 88 Z" fill={skin} />
          <path d="M52 70 L68 70 L68 78 C62 82 56 80 52 76 Z" fill={skinShade} opacity="0.55" />

          {/* Cabeça */}
          <ellipse cx="60" cy="50" rx="23" ry="26" fill={skin} />
          <path d="M37 52 C37 64 46 74 60 76 C50 72 42 64 41 50 Z" fill={skinShade} opacity="0.35" />

          {/* Cabelo frontal, com sombra deslocada e brilho */}
          <path d={hair} fill={hairShade} transform="translate(2.5,2.5)" opacity="0.5" />
          <path d={hair} fill={`url(#${id}-hair)`} />
          <path d="M43 27 C51 19 63 16 73 20 C64 22 53 26 47 33 Z" fill="#ffffff" opacity="0.16" />

          {/* Luz de contorno vinda da aura */}
          <path d="M39 38 C33 47 34 61 40 70 C35 61 34 46 39 38 Z" fill={auraColor} opacity="0.55" />

          {/* Sobrancelhas angulosas */}
          <g fill={hairShade}>
            <path d="M42 40 L57 43.5 L56.5 45.8 L42.5 42.6 Z" />
            <path d="M78 40 L63 43.5 L63.5 45.8 L77.5 42.6 Z" />
          </g>

          {/* Olhos estilizados: pestana grossa, íris, pupila e brilho */}
          <g fill="var(--color-void-950)">
            <path d="M42 51 Q48.5 43 58 48.5 L57 51.5 Q50 46.5 43.5 53.5 Z" />
            <path d="M78 51 Q71.5 43 62 48.5 L63 51.5 Q70 46.5 76.5 53.5 Z" />
          </g>
          <ellipse cx="50" cy="52.5" rx="3.4" ry="4.2" fill={`url(#${id}-iris)`} />
          <ellipse cx="70" cy="52.5" rx="3.4" ry="4.2" fill={`url(#${id}-iris)`} />
          <ellipse cx="50" cy="53.6" rx="1.4" ry="2.2" fill="var(--color-void-950)" />
          <ellipse cx="70" cy="53.6" rx="1.4" ry="2.2" fill="var(--color-void-950)" />
          <circle cx="48.7" cy="50.6" r="1.2" fill="#ffffff" opacity="0.95" />
          <circle cx="68.7" cy="50.6" r="1.2" fill="#ffffff" opacity="0.95" />
          <g stroke="var(--color-void-950)" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45">
            <path d="M45 57.6 Q50 59.4 55 57.6" />
            <path d="M65 57.6 Q70 59.4 75 57.6" />
          </g>

          {/* Nariz e boca */}
          <g stroke="var(--color-void-950)" strokeWidth="1.1" strokeLinecap="round" fill="none">
            <path d="M60.5 57 L58.5 61.5 L61.5 61.5" opacity="0.32" />
            <path d="M56 66.5 Q60 69 64 66.5" opacity="0.65" />
          </g>

          {/* Marca no rosto — só em metade das variantes */}
          {hasMark && <path d="M70 61 L77 55 L78.6 57.4 L71.6 63.4 Z" fill={accent} opacity="0.8" />}

          {/* Partículas espirituais em primeiro plano */}
          <g fill={auraColor} className={animated ? 'animate-pulse-glow' : undefined}>
            <circle cx="24" cy="70" r="1.8" />
            <circle cx="98" cy="58" r="1.4" />
            <circle cx="88" cy="80" r="2.2" opacity="0.7" />
            <circle cx="18" cy="46" r="1.2" opacity="0.8" />
          </g>
        </g>
      </svg>
      )}
    </div>
  )
}

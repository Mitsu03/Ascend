import { useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * Peças de arte originais da Ascend, todas desenhadas por código.
 * Nada é descarregado nem importado de terceiros: são caminhos SVG, gradientes
 * e animações CSS escritos de raiz, para a aplicação continuar a funcionar
 * offline e o repositório não carregar imagens externas.
 *
 * Todas as peças são decorativas — ficam marcadas com `aria-hidden` e nunca
 * intercetam o rato. As animações contínuas respeitam a regra global de
 * `prefers-reduced-motion` definida em index.css.
 */

/** Os `useId` do React trazem dois pontos, inválidos em `url(#…)`. */
function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/:/g, '')}`
}

type Tone = 'ember' | 'crimson' | 'gold' | 'spirit'

const TONE_VAR: Record<Tone, string> = {
  ember: 'var(--color-ember)',
  crimson: 'var(--color-crimson-soft)',
  gold: 'var(--color-gold)',
  spirit: 'var(--color-spirit)',
}

/* ------------------------------------------------------------------ */
/* Céu de crepúsculo                                                    */
/* ------------------------------------------------------------------ */

interface TwilightSkyProps {
  className?: string
  /** Opacidade global da peça — permite usar o mesmo céu como fundo discreto. */
  opacity?: number
  /** Esconde as serras quando a peça é usada em caixas baixas. */
  ridges?: boolean
}

/**
 * Crepúsculo: gradiente do preto ao incandescente, disco solar baixo,
 * faixas de tinta a atravessar o céu e duas serras recortadas.
 */
export function TwilightSky({ className, opacity = 1, ridges = true }: TwilightSkyProps) {
  const id = useSvgId('sky')

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={cn('size-full', className)}
      style={{ opacity }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-air`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-void-950)" />
          <stop offset="38%" stopColor="var(--color-void-900)" />
          <stop offset="62%" stopColor="var(--color-crimson)" stopOpacity="0.55" />
          <stop offset="80%" stopColor="var(--color-ember)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--color-gold-soft)" stopOpacity="0.35" />
        </linearGradient>

        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-gold-soft)" stopOpacity="0.85" />
          <stop offset="45%" stopColor="var(--color-ember)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-ember)" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-vignette`} cx="50%" cy="46%" r="74%">
          <stop offset="62%" stopColor="var(--color-void-950)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--color-void-950)" stopOpacity="0.6" />
        </radialGradient>

        {/* Faixa de tinta reutilizada com deslocações e escalas diferentes. */}
        <path
          id={`${id}-band`}
          d="M-30 20 C50 4 118 26 190 12 C246 1 306 16 430 4 L430 22 C306 36 246 22 190 32 C118 46 50 34 -30 40 Z"
        />
      </defs>

      <rect width="400" height="260" fill={`url(#${id}-air)`} />

      {/* Disco solar e os seus anéis de energia, baixos no horizonte. */}
      <g>
        <circle cx="286" cy="196" r="92" fill={`url(#${id}-halo)`} />
        <circle cx="286" cy="196" r="34" fill="var(--color-gold-soft)" opacity="0.9" />
        <circle cx="286" cy="196" r="52" fill="none" stroke="var(--color-ember)" strokeWidth="1" opacity="0.35" />
        <circle cx="286" cy="196" r="70" fill="none" stroke="var(--color-ember)" strokeWidth="0.8" opacity="0.18" />
      </g>

      {/* Tinta a correr no céu — deriva muito lenta, quase impercetível. */}
      <g className="animate-drift" fill="var(--color-void-950)">
        <use href={`#${id}-band`} opacity="0.5" />
        <use href={`#${id}-band`} transform="translate(-40 62) scale(1.12 0.8)" opacity="0.42" />
        <use href={`#${id}-band`} transform="translate(30 122) scale(0.9 1.3)" opacity="0.55" />
        <use href={`#${id}-band`} transform="translate(-10 168) scale(1.2 0.7)" opacity="0.4" />
      </g>

      {ridges && (
        <>
          {/* Serra distante */}
          <path
            d="M-10 260 L-10 212 L42 182 L88 208 L130 174 L178 210 L216 188 L264 216 L312 180 L362 210 L410 188 L410 260 Z"
            fill="var(--color-void-950)"
            opacity="0.75"
          />
          {/* Serra próxima, mais recortada e totalmente opaca */}
          <path
            d="M-10 260 L-10 236 L36 218 L74 238 L118 210 L152 236 L204 214 L246 240 L296 216 L340 238 L410 218 L410 260 Z"
            fill="var(--color-void-950)"
          />
        </>
      )}

      <rect width="400" height="260" fill={`url(#${id}-vignette)`} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Cortes de lâmina                                                     */
/* ------------------------------------------------------------------ */

interface BladeSlashesProps {
  className?: string
  tone?: Tone
  opacity?: number
  /** Anima a entrada de cada corte, como se fossem desferidos à vez. */
  animated?: boolean
}

/**
 * Cortes de lâmina: fusos curtos e afilados, encostados aos cantos.
 *
 * Não atravessam a caixa de ponta a ponta — um corte que percorre o ecrã
 * inteiro lê-se como um risco de caneta, não como um golpe. Cada fuso tem os
 * dois pontos de controlo quase coincidentes, por isso só ganha espessura a
 * meio e afina nas pontas, e o gume usa `non-scaling-stroke` para se manter
 * fino mesmo quando o SVG é ampliado por `slice`.
 */
export function BladeSlashes({ className, tone = 'ember', opacity = 1, animated = false }: BladeSlashesProps) {
  const id = useSvgId('slash')
  const colour = TONE_VAR[tone]

  const slashes = [
    // Golpe principal, no canto superior direito.
    {
      body: 'M212 96 Q 300 52 396 -4 Q 299 58 211 97 Z',
      spine: 'M212 96 Q 300 55 396 -4',
      o: 0.7,
      delay: 0,
    },
    // Contragolpe curto, mais acima e mais ténue.
    {
      body: 'M268 38 Q 330 16 398 -18 Q 329 20 267 39 Z',
      spine: 'M268 38 Q 330 18 398 -18',
      o: 0.34,
      delay: 0.1,
    },
    // Golpe no canto inferior esquerdo, a fechar a composição.
    {
      body: 'M4 292 Q 78 254 168 208 Q 77 259 5 293 Z',
      spine: 'M4 292 Q 78 256 168 208',
      o: 0.4,
      delay: 0.2,
    },
  ]

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={cn('size-full', className)}
      style={{ opacity }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-edge`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={colour} stopOpacity="0" />
          <stop offset="30%" stopColor={colour} stopOpacity="0.35" />
          <stop offset="55%" stopColor="var(--color-gold-soft)" stopOpacity="0.9" />
          <stop offset="78%" stopColor={colour} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colour} stopOpacity="0" />
        </linearGradient>
      </defs>

      {slashes.map((slash) => (
        <g
          key={slash.spine}
          opacity={slash.o}
          className={animated ? 'animate-slash' : undefined}
          style={animated ? { animationDelay: `${slash.delay}s` } : undefined}
        >
          <path d={slash.body} fill={`url(#${id}-edge)`} opacity="0.5" />
          <path
            d={slash.spine}
            fill="none"
            stroke={`url(#${id}-edge)`}
            strokeWidth="1"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Partículas espirituais                                               */
/* ------------------------------------------------------------------ */

/**
 * Posições fixas — nada de aleatório em tempo de render, para as partículas
 * não saltarem de sítio a cada re-render do componente que as contém.
 */
const MOTES = [
  { left: 6, bottom: -4, size: 3, travel: -190, drift: 16, duration: 11, delay: 0 },
  { left: 18, bottom: 8, size: 2, travel: -150, drift: -10, duration: 9, delay: 1.8 },
  { left: 31, bottom: -8, size: 4, travel: -220, drift: 22, duration: 13, delay: 0.7 },
  { left: 44, bottom: 4, size: 2, travel: -160, drift: -14, duration: 10, delay: 3.1 },
  { left: 57, bottom: -6, size: 3, travel: -200, drift: 12, duration: 12, delay: 1.2 },
  { left: 68, bottom: 10, size: 2, travel: -140, drift: 18, duration: 8.5, delay: 2.6 },
  { left: 79, bottom: -2, size: 4, travel: -210, drift: -18, duration: 14, delay: 0.3 },
  { left: 88, bottom: 6, size: 2, travel: -170, drift: 10, duration: 10.5, delay: 4 },
  { left: 96, bottom: -6, size: 3, travel: -185, drift: -12, duration: 12.5, delay: 2.2 },
]

interface SpiritMotesProps {
  className?: string
  tone?: Tone
  /** Quantas partículas usar (máximo: as 9 posições definidas). */
  count?: number
}

/** Pó espiritual a subir, com desvio lateral e desvanecimento no topo. */
export function SpiritMotes({ className, tone = 'ember', count = 9 }: SpiritMotesProps) {
  const colour = TONE_VAR[tone]

  return (
    <div className={cn('art-layer', className)} aria-hidden="true">
      {MOTES.slice(0, count).map((mote) => (
        <span
          key={mote.left}
          className="absolute animate-mote rounded-full"
          style={
            {
              left: `${mote.left}%`,
              bottom: `${mote.bottom}%`,
              width: mote.size,
              height: mote.size,
              opacity: 0.5,
              background: colour,
              boxShadow: `0 0 ${mote.size * 3}px ${colour}`,
              animationDuration: `${mote.duration}s`,
              animationDelay: `${mote.delay}s`,
              '--mote-travel': `${mote.travel}px`,
              '--mote-drift': `${mote.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Explosão de energia                                                  */
/* ------------------------------------------------------------------ */

interface SpiritBurstProps {
  className?: string
  tone?: Tone
  opacity?: number
}

/** Coroa de raios afilados a girar devagar — usada na celebração. */
export function SpiritBurst({ className, tone = 'gold', opacity = 1 }: SpiritBurstProps) {
  const id = useSvgId('burst')
  const colour = TONE_VAR[tone]
  const rays = Array.from({ length: 20 }, (_, index) => index)

  return (
    <svg
      viewBox="-200 -200 400 400"
      className={cn('size-full', className)}
      style={{ opacity }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colour} stopOpacity="0.55" />
          <stop offset="60%" stopColor={colour} stopOpacity="0.12" />
          <stop offset="100%" stopColor={colour} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="0" cy="0" r="190" fill={`url(#${id}-core)`} />

      <g className="animate-rays" style={{ transformOrigin: 'center' }} fill={colour}>
        {rays.map((index) =>
          index % 2 === 0 ? (
            <polygon key={index} points="0,0 -3,-196 3,-196" opacity="0.3" transform={`rotate(${index * 18})`} />
          ) : (
            <polygon key={index} points="0,0 -6,-124 6,-124" opacity="0.14" transform={`rotate(${index * 18})`} />
          ),
        )}
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Mancha de tinta                                                      */
/* ------------------------------------------------------------------ */

interface InkWashProps {
  className?: string
  tone?: Tone
  opacity?: number
}

/** Borrão de tinta com respingos — dá textura a cantos e cabeçalhos. */
export function InkWash({ className, tone = 'crimson', opacity = 0.5 }: InkWashProps) {
  const id = useSvgId('ink')
  const colour = TONE_VAR[tone]

  return (
    <svg
      viewBox="0 0 200 160"
      className={cn('size-full', className)}
      style={{ opacity }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-wash`} cx="42%" cy="40%" r="62%">
          <stop offset="0%" stopColor={colour} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colour} stopOpacity="0.15" />
        </radialGradient>
      </defs>

      <path
        d="M92 6 C136 -2 176 20 186 58 C196 96 174 128 138 142 C100 157 52 148 26 120 C2 94 0 52 24 28 C42 10 66 12 92 6 Z"
        fill={`url(#${id}-wash)`}
      />
      {/* Respingos soltos à volta do borrão principal */}
      <g fill={colour} opacity="0.55">
        <circle cx="188" cy="128" r="5" />
        <circle cx="176" cy="146" r="2.5" />
        <circle cx="14" cy="132" r="3.5" />
        <circle cx="30" cy="150" r="1.8" />
        <circle cx="150" cy="8" r="2.2" />
      </g>
    </svg>
  )
}

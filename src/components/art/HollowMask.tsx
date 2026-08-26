import { useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * Máscara de Hollow, desenhada de raiz em SVG.
 *
 * É a peça de arte central do tema: osso branco, órbitas vazias com uma brasa
 * lá dentro, dentes serrilhados e as marcas encarnadas na metade esquerda.
 * Nenhum traçado é copiado de lado nenhum — são caminhos próprios, para a
 * aplicação continuar a funcionar offline e o repositório não transportar
 * material de terceiros.
 *
 * A máscara tem três estados, ligados ao progresso do utilizador:
 * `nascente` (translúcida, ainda a formar-se), `plena` (opaca) e `rachada`
 * (com as fendas por onde o Shinigami volta a aparecer).
 */

export type MaskStage = 'nascente' | 'plena' | 'rachada'

/** Os `useId` do React trazem dois pontos, inválidos dentro de `url(#…)`. */
function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/:/g, '')}`
}

/* Caminhos partilhados pelas duas formas de usar a máscara. -------------- */

/** Contorno do osso, num espaço de coordenadas de 100×100. */
const SHELL =
  'M50 1 C73 1 89 18 91 42 C92.5 60 85 78 72 90 C65 96.5 58 100 50 100 C42 100 35 96.5 28 90 C15 78 7.5 60 9 42 C11 18 27 1 50 1 Z'

/** Órbitas — quadriláteros inclinados, mais estreitos por baixo. */
const EYE_LEFT = 'M20 30 L44 38 L45.5 50 L23 46 Z'
const EYE_RIGHT = 'M80 30 L56 38 L54.5 50 L77 46 Z'

/** Fenda da boca, onde assentam as duas fiadas de dentes. */
const MOUTH = 'M17 60 L83 60 L77.5 83 L22.5 83 Z'

/** Fiada de cima: pontas viradas para baixo. */
const TEETH_TOP =
  'M17 60 L83 60 L80 72 L74.5 61.5 L68 73 L61.5 61.5 L55 73 L48.5 61.5 L42 73 L35.5 61.5 L29 73 L23 61.5 L20 72 Z'

/** Fiada de baixo: pontas viradas para cima, desencontradas da de cima. */
const TEETH_BOTTOM =
  'M22.5 83 L77.5 83 L74.5 72 L69 82 L63 71.5 L57 82 L51 71.5 L45 82 L39 71.5 L33 82 L27 71.5 L25 79 Z'

/** Marcas encarnadas — duas faixas verticais na metade esquerda do rosto. */
const MARK_WIDE = 'M27.5 6.5 L38.5 3 L35.5 57 L28 55 Z'
const MARK_THIN = 'M43 2 L48 1.5 L46.5 26 L42.5 26 Z'

/** Fendas do estado `rachada`, a partir do canto superior direito. */
const CRACKS = [
  'M72 6 L78 22 L70 20 L74 36 L66 30 L69 44',
  'M88 34 L79 40 L86 46 L77 52',
  'M60 96 L64 84 L56 88 L59 76',
]

interface MaskShapeProps {
  stage?: MaskStage
  /** Cor da brasa dentro das órbitas. */
  glow?: string
  /** Anima a respiração do brilho das órbitas. */
  animated?: boolean
}

/**
 * A máscara como `<g>`, para ser embutida num SVG que já existe (o avatar).
 * O chamador posiciona-a com `transform`; o desenho ocupa 0–100 nos dois eixos.
 */
export function HollowMaskShape({ stage = 'plena', glow = 'var(--color-ember)', animated = true }: MaskShapeProps) {
  const id = useSvgId('mask')
  const cracked = stage === 'rachada'
  const shellOpacity = stage === 'nascente' ? 0.55 : 1

  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bone`} x1="0.25" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="52%" stopColor="var(--color-bone)" />
          <stop offset="100%" stopColor="var(--color-bone-deep)" />
        </linearGradient>
        <radialGradient id={`${id}-socket`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.95" />
          <stop offset="55%" stopColor={glow} stopOpacity="0.35" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        {/* A máscara recorta tudo o que lhe é sobreposto — brilho incluído. */}
        <clipPath id={`${id}-shell`}>
          <path d={SHELL} />
        </clipPath>
      </defs>

      {/* Casco de osso, com uma sombra interior a dar volume ao maxilar. */}
      <path d={SHELL} fill={`url(#${id}-bone)`} opacity={shellOpacity} />
      <g clipPath={`url(#${id}-shell)`} opacity={shellOpacity}>
        <path
          d="M9 42 C9 66 18 84 34 96 L9 96 Z"
          fill="var(--color-bone-deep)"
          opacity="0.5"
        />
        <path d="M50 1 C73 1 89 18 91 42 L91 22 C82 8 66 1 50 1 Z" fill="#ffffff" opacity="0.5" />

        {/* Marcas encarnadas */}
        <g fill="var(--color-crimson)" opacity="0.85">
          <path d={MARK_WIDE} />
          <path d={MARK_THIN} />
        </g>

        {/* Órbitas: buraco preto, brasa e contorno afiado */}
        <g>
          <path d={EYE_LEFT} fill="var(--color-void-950)" />
          <path d={EYE_RIGHT} fill="var(--color-void-950)" />
        </g>
        <g className={animated ? 'animate-pulse-glow' : undefined}>
          <ellipse cx="32" cy="41" rx="13" ry="11" fill={`url(#${id}-socket)`} />
          <ellipse cx="68" cy="41" rx="13" ry="11" fill={`url(#${id}-socket)`} />
          <circle cx="32" cy="41" r="3.2" fill={glow} />
          <circle cx="68" cy="41" r="3.2" fill={glow} />
        </g>

        {/* Boca: vazio escuro atrás das duas fiadas de dentes */}
        <path d={MOUTH} fill="var(--color-void-950)" />
        <g fill={`url(#${id}-bone)`}>
          <path d={TEETH_TOP} />
          <path d={TEETH_BOTTOM} />
        </g>
        {/* Fio de sombra a separar os dentes do osso do rosto */}
        <path d={MOUTH} fill="none" stroke="var(--color-bone-deep)" strokeWidth="1.2" opacity="0.7" />

        {cracked && (
          <g stroke="var(--color-void-950)" strokeWidth="2" fill="none" strokeLinejoin="round" opacity="0.82">
            {CRACKS.map((crack) => (
              <path key={crack} d={crack} />
            ))}
          </g>
        )}
      </g>

      {/* Aresta exterior, para a máscara não se dissolver em fundos claros */}
      <path
        d={SHELL}
        fill="none"
        stroke="var(--color-void-950)"
        strokeWidth="1.4"
        opacity={stage === 'nascente' ? 0.3 : 0.55}
      />
    </g>
  )
}

interface HollowMaskProps extends MaskShapeProps {
  size?: number
  className?: string
  /** Texto alternativo. Sem ele a máscara fica fora da árvore de acessibilidade. */
  title?: string
}

/** A máscara isolada, para emblemas, ecrãs vazios e cabeçalhos. */
export function HollowMask({ size = 64, className, title, ...shape }: HollowMaskProps) {
  return (
    <svg
      viewBox="-4 -4 108 108"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <HollowMaskShape {...shape} />
    </svg>
  )
}

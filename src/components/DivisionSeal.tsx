import { ArtIcon } from '@/components/ArtIcon'
import { getDivision } from '@/data/divisions'
import { cn } from '@/lib/cn'

/**
 * Selo da divisão: o emblema da divisão dentro de um anel duplo, com o
 * numeral em kanji por baixo. É a marca que identifica o utilizador em toda a
 * aplicação — barra lateral, ficha de Shinigami, celebração e conquistas.
 *
 * O emblema é arte de game-icons.net (CC BY 3.0); o anel e o numeral são
 * desenhados aqui.
 */

/** Numerais japoneses de 1 a 13, na ordem das divisões do Gotei. */
export const DIVISION_KANJI = [
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
  '十一',
  '十二',
  '十三',
]

export function divisionKanji(id: number): string {
  return DIVISION_KANJI[id - 1] ?? DIVISION_KANJI[12]
}

interface DivisionSealProps {
  /** Divisão 1–13. Sem valor, cai na divisão por omissão. */
  divisionId: number | undefined
  size?: number
  /** Esconde o numeral — usado nos tamanhos pequenos, onde não seria legível. */
  compact?: boolean
  className?: string
  /** Nome acessível. Sem ele o selo é decorativo. */
  title?: string
}

export function DivisionSeal({ divisionId, size = 44, compact, className, title }: DivisionSealProps) {
  const division = getDivision(divisionId)
  /*
   * O numeral só entra quando é legível. Em kanji precisa de mais espaço — as
   * divisões 11 a 13 levam dois caracteres —, por isso abaixo dos 56 px mostra
   * o número árabe e abaixo dos 30 px não mostra nada.
   */
  const numeral = size >= 56 ? divisionKanji(division.id) : size >= 30 ? String(division.id) : null
  const showNumeral = !compact && numeral !== null

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size, color: division.color }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
    >
      {/* Anel duplo, na cor do reiatsu da divisão */}
      <span
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: `color-mix(in oklab, ${division.color} 55%, transparent)` }}
      />
      <span
        className="absolute rounded-full border"
        style={{
          inset: Math.max(2, size * 0.09),
          borderColor: `color-mix(in oklab, ${division.color} 22%, transparent)`,
        }}
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, color-mix(in oklab, ${division.color} 16%, transparent), transparent 72%)` }}
      />

      <ArtIcon
        name={division.emblem}
        size={Math.round(size * (showNumeral ? 0.5 : 0.58))}
        className="relative"
        style={showNumeral ? { transform: `translateY(${-size * 0.07}px)` } : undefined}
      />

      {showNumeral && (
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded px-1 font-display font-bold leading-none"
          style={{
            bottom: size * 0.06,
            fontSize: Math.max(9, size * 0.26),
            background: 'color-mix(in oklab, var(--color-void-950) 82%, transparent)',
          }}
        >
          {numeral}
        </span>
      )}
    </span>
  )
}

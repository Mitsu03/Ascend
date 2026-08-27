import { ArtIcon } from '@/components/ArtIcon'
import { cn } from '@/lib/cn'
import type { ArtIconName } from '@/data/artIcons'

/**
 * O fundo de um ecrã: uma aura de reiatsu, um kanji enorme quase apagado e um
 * emblema de linha ao canto. Não é decoração aleatória — cada ecrã tem o seu
 * par kanji/emblema fixo, que é como se reconhece a secção pelo canto do olho
 * antes de se ler o que quer que seja.
 *
 * Fica tudo atrás do conteúdo e nada disto apanha o rato.
 */

export type ScreenName = 'quartel' | 'dojo' | 'racoes' | 'ordens' | 'ficha'

interface Backdrop {
  /** Aura de reiatsu: dimensão, posição e cor da mancha radial. */
  aura: string
  kanji?: {
    glyph: string
    /** Corpo em px — os kanji são grandes de propósito, entre 196 e 200. */
    size: number
    className: string
  }
  /** Emblema de linha ao canto, no tom `faint` (--color-void-500). */
  mark?: {
    name: ArtIconName
    size: number
    className: string
    /** Opacidade em milésimos, para não perder as frações do protótipo. */
    opacity: number
    rotate?: number
  }
}

const BACKDROPS: Record<ScreenName, Backdrop> = {
  quartel: {
    // O Quartel não leva kanji de ecrã: o 隊 vive dentro do cartão da ordem
    // do dia, para o herói ficar com o peso todo.
    aura: 'radial-gradient(44rem 30rem at 50% -12%, rgba(255,122,26,.14), transparent 60%)',
  },
  dojo: {
    aura: 'radial-gradient(40rem 28rem at 50% 108%, rgba(255,122,26,.16), transparent 62%)',
    kanji: { glyph: '刃', size: 200, className: 'top-[150px] -left-[34px]' },
    mark: { name: 'katana', size: 150, className: 'bottom-[120px] -right-[38px]', opacity: 55, rotate: -22 },
  },
  racoes: {
    aura: 'radial-gradient(40rem 24rem at 82% -8%, rgba(184,18,54,.2), transparent 60%)',
    kanji: { glyph: '糧', size: 196, className: 'top-[118px] -right-[40px]' },
    mark: { name: 'soul-vessel', size: 140, className: 'bottom-[130px] -left-[30px]', opacity: 50 },
  },
  ordens: {
    aura: 'radial-gradient(40rem 26rem at 50% -10%, rgba(255,176,32,.18), transparent 60%)',
    kanji: { glyph: '令', size: 200, className: 'top-[126px] -right-[42px]' },
    mark: { name: 'hell-butterfly', size: 120, className: 'bottom-[140px] -left-[26px]', opacity: 60, rotate: 12 },
  },
  ficha: {
    aura: 'radial-gradient(42rem 28rem at 50% -10%, rgba(232,54,92,.16), transparent 60%)',
  },
}

export function ScreenBackdrop({ screen }: { screen: ScreenName }) {
  const backdrop = BACKDROPS[screen]

  return (
    // O preto opaco tapa o gradiente global do `body`, que serve os ecrãs de
    // entrada mas aqui competia com a aura própria de cada secção.
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void-900 select-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ background: backdrop.aura }} />

      {backdrop.kanji && (
        <div
          className={cn('absolute font-kanji leading-[0.78] text-ink/[0.035]', backdrop.kanji.className)}
          style={{ fontSize: backdrop.kanji.size }}
        >
          {backdrop.kanji.glyph}
        </div>
      )}

      {backdrop.mark && (
        <div
          className={cn('absolute text-void-500', backdrop.mark.className)}
          style={{
            opacity: backdrop.mark.opacity / 1000,
            transform: backdrop.mark.rotate ? `rotate(${backdrop.mark.rotate}deg)` : undefined,
          }}
        >
          <ArtIcon name={backdrop.mark.name} size={backdrop.mark.size} />
        </div>
      )}

      {/* A ordem do capitão, escrita na vertical à margem — só nas Ordens. */}
      {screen === 'ordens' && (
        <div
          className="absolute top-[190px] left-[10px] font-kanji text-[15px] font-bold tracking-[0.34em] text-ink/10 [writing-mode:vertical-rl]"
        >
          隊長の命
        </div>
      )}
    </div>
  )
}

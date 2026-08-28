import type { ReactNode } from 'react'
import { ArtIcon } from '@/components/ArtIcon'
import { Icon } from '@/components/ui/Icon'
import { useHeroTitle } from '@/components/layout/AppShell'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { levelFromXp } from '@/services/calculations'
import { useGameStore } from '@/store/gameStore'
import { useUserStore } from '@/store/userStore'

/**
 * Cabeçalho de ecrã. Cada secção traz o seu — o do Quartel diz quem se é, o
 * das Rações diz que dia se está a ver — em vez de uma barra única igual para
 * todos, que só repetia a mesma informação cinco vezes.
 *
 * O `pt` reserva o notch: 58 px no protótipo, aqui a soma do inset seguro do
 * dispositivo com o mesmo respiro. No browser o inset é 0 e sobra o respiro.
 */
export function ScreenHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        'relative flex items-center justify-between gap-2.5 px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] md:hidden',
        className,
      )}
    >
      {children}
    </header>
  )
}

/** Título simples à esquerda, como «Rações · hoje». */
export function ScreenTitle({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold text-ink-muted">{children}</span>
}

/**
 * Medalhão de identidade: as lâminas cruzadas dentro de um anel carmim, com o
 * nome e a patente ao lado. É a assinatura do Quartel.
 */
export function HeaderIdentity() {
  const name = useUserStore((state) => state.profile?.name)
  const xp = useGameStore((state) => state.xp)
  const title = useHeroTitle(levelFromXp(xp).level)

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="relative inline-flex size-8 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-crimson-soft/50" aria-hidden="true" />
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,54,92,.14), transparent 72%)' }}
          aria-hidden="true"
        />
        <ArtIcon name="crossed-swords" size={17} className="relative text-crimson-soft" />
      </span>
      {/*
        Nome e patente estavam na mesma linha, separados por «·», dentro de
        172 px num iPhone SE. Com um nome de 21 caracteres a patente ficava
        cortada a meio («Alma Determin…») e com os 24 que o campo permite
        desaparecia por inteiro. Em duas linhas cabem as duas: o nome, que é do
        utilizador, fica sempre completo, e a patente só corta em último caso.
      */}
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-ink">{name}</span>
        <span className="block truncate text-[11px] text-ink-muted">{title}</span>
      </span>
    </div>
  )
}

/** Dias de serviço e kan, à direita: os dois números que mudam todos os dias. */
export function HeaderTally() {
  const { n } = useI18n()
  const streak = useGameStore((state) => state.streak)
  const coins = useGameStore((state) => state.coins)
  const { t } = useI18n()

  return (
    // Os números aparecem sozinhos, sem rótulo visível — o ícone é que diz o
    // que são. Para quem ouve o ecrã, o rótulo vai num `sr-only`; sem ele o
    // cabeçalho era lido como «5. 1 240.».
    <div className="flex shrink-0 items-center gap-3">
      <span className="flex items-center gap-1" title={t.dashboard.streak}>
        <ArtIcon name="fire-ray" size={13} className="text-warn" />
        <span className="font-display text-[15px] font-bold text-warn">{streak}</span>
        <span className="sr-only">{t.dashboard.streak}</span>
      </span>
      <span className="flex items-center gap-1" title={t.common.coins}>
        <span className="size-2 rounded-full bg-gold" aria-hidden="true" />
        <span className="font-display text-[15px] font-bold tabular-nums text-gold">{n(coins)}</span>
        <span className="sr-only">{t.common.coins}</span>
      </span>
    </div>
  )
}

/** Botão discreto de canto, em pílula — «Foto · código» nas Rações. */
export function HeaderAction({
  icon,
  children,
  onClick,
}: {
  icon?: string
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // A pílula tinha 28 px de altura. Passa a 36 no desenho e a 44 pt de área
      // de toque — é o único botão deste cabeçalho e não tem vizinhos perto.
      className="tap-target flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-void-600 bg-void-800/70 px-3.5 text-[11.5px] font-semibold text-ink-muted transition-colors active:opacity-90"
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  )
}

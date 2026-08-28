import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArtIcon } from '@/components/ArtIcon'
import { DivisionSeal } from '@/components/DivisionSeal'
import { HollowMask } from '@/components/art/HollowMask'
import { getCosmetic } from '@/data/cosmetics'
import { getDivision } from '@/data/divisions'
import { useI18n } from '@/i18n'
import { levelFromXp, titleKeyForLevel } from '@/services/calculations'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/Progress'
import { useGameStore } from '@/store/gameStore'
import { useUserStore } from '@/store/userStore'
import type { ArtIconName } from '@/data/artIcons'
import type { Dictionary } from '@/i18n'

/**
 * As secções da aplicação, com o emblema que as identifica. Os emblemas são de
 * game-icons.net (CC BY 3.0) — ver `public/art/LICENSE.md`.
 *
 * As escolhas seguem o que cada secção é no Seireitei: o quartel é o portal do
 * santuário, o dojo é a zanpakutō, as ordens chegam por borboleta do inferno e
 * a ficha do Shinigami é a máscara.
 */
const NAV_EMBLEMS: Record<string, ArtIconName> = {
  '/': 'shinto-shrine',
  '/treino': 'katana',
  '/nutricao': 'soul-vessel',
  '/missoes': 'hell-butterfly',
  '/perfil': 'hollow-mask',
}

function navItems(t: Dictionary) {
  return [
    { to: '/', label: t.nav.home, end: true },
    { to: '/treino', label: t.nav.workout, end: false },
    { to: '/nutricao', label: t.nav.nutrition, end: false },
    { to: '/missoes', label: t.nav.quests, end: false },
    { to: '/perfil', label: t.nav.profile, end: false },
  ].map((item) => ({ ...item, emblem: NAV_EMBLEMS[item.to] }))
}

function Logo() {
  const { t } = useI18n()

  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex size-9 items-center justify-center">
        <span
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-ember/25 to-crimson/25 blur-[6px]"
          aria-hidden="true"
        />
        <HollowMask size={34} className="relative" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-2xl font-bold tracking-[0.22em] text-ink">{t.app.name}</span>
        <span className="block text-[10px] tracking-[0.5em] text-ember/85">{t.app.kanji}</span>
      </span>
    </div>
  )
}

/** Título ativo: o cosmético equipado tem precedência sobre a patente. */
export function useHeroTitle(level: number): string {
  const { t, loc } = useI18n()
  const equippedTitle = useGameStore((state) => state.equipped.title)
  const cosmetic = equippedTitle ? getCosmetic(equippedTitle) : undefined
  return cosmetic ? loc(cosmetic.name) : t.levelTitles[titleKeyForLevel(level)]
}

/** Cartão de patente da barra lateral: selo da divisão, título e reiatsu. */
function RankCard() {
  const { t, n, loc } = useI18n()
  const xp = useGameStore((state) => state.xp)
  const coins = useGameStore((state) => state.coins)
  const divisionId = useUserStore((state) => state.profile?.divisionId)
  const division = getDivision(divisionId)
  const info = levelFromXp(xp)
  const title = useHeroTitle(info.level)

  return (
    <div className="edge-glint rounded-xl border border-void-600/70 bg-void-800/60 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <DivisionSeal divisionId={division.id} size={38} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink-muted">{title}</p>
            <p className="truncate text-[11px] text-ink-faint">{loc(division.name)}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold tabular-nums text-gold">
          <Icon name="Coins" size={13} />
          {n(coins)}
        </span>
      </div>
      <ProgressBar
        value={info.currentLevelXp}
        max={info.nextLevelXp}
        tone="xp"
        height="sm"
        className="mt-3"
        label={t.common.levelProgress}
        showShimmer
      />
      <p className="mt-1.5 flex items-center justify-between text-[11px] tabular-nums text-ink-faint">
        <span>{t.common.levelWithNumber(info.level)}</span>
        <span>{t.common.xpProgress(n(info.currentLevelXp), n(info.nextLevelXp))}</span>
      </p>
    </div>
  )
}

function Sidebar() {
  const { t } = useI18n()
  const name = useUserStore((state) => state.profile?.name)

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-void-700/70 bg-void-850/85 backdrop-blur-xl md:flex">
      <div className="px-5 py-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label={t.app.mainNav}>
        {navItems(t).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-ember/18 to-transparent text-ember shadow-[inset_2px_0_0_0_var(--color-ember)]'
                  : 'text-ink-muted hover:bg-void-700/60 hover:text-ink',
              )
            }
          >
            <ArtIcon name={item.emblem} size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3 p-3">
        {name && <RankCard />}
        <p className="px-1 text-[11px] leading-relaxed text-ink-faint">{t.app.localDataNote}</p>
      </div>
    </aside>
  )
}

/**
 * Barra de separadores. O ícone vive dentro de uma pílula de 34×24 que se
 * acende no separador ativo — é a pílula, e não a cor do traço, que dá o
 * estado, por isso continua a ler-se de relance mesmo em movimento.
 */
function BottomNav() {
  const { t } = useI18n()

  return (
    <nav
      // `--tab-bar-pad` é o inset do indicador de início — ver a conta em
      // `index.css`. Os insets laterais só valem alguma coisa em
      // horizontal, onde o notch fica de lado; em vertical são zero e a barra
      // continua de bordo a bordo.
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-void-700 bg-void-850/95 pr-[env(safe-area-inset-right)] pb-[var(--tab-bar-pad)] pl-[env(safe-area-inset-left)] backdrop-blur-xl md:hidden"
      aria-label={t.app.mainNav}
    >
      {navItems(t).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold transition-colors',
              isActive ? 'text-ember' : 'text-ink-muted',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex h-6 w-[34px] items-center justify-center rounded-lg transition-colors',
                  isActive && 'bg-ember/[0.16]',
                )}
              >
                <ArtIcon name={item.emblem} size={19} />
              </span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function MobileHeader() {
  const { n } = useI18n()
  const coins = useGameStore((state) => state.coins)
  const streak = useGameStore((state) => state.streak)
  const divisionId = useUserStore((state) => state.profile?.divisionId)

  return (
    // O `pt` inclui `safe-area-inset-top` para a barra não ficar por baixo do
    // status bar / Dynamic Island na app nativa; no browser o inset é 0.
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-void-700/70 bg-void-900/90 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-xl md:hidden">
      <Logo />
      <div className="flex items-center gap-2.5 text-xs font-semibold tabular-nums">
        <span className="flex items-center gap-1 text-warn">
          <Icon name="Flame" size={14} />
          {streak}
        </span>
        <span className="flex items-center gap-1 text-gold">
          <Icon name="Coins" size={14} />
          {n(coins)}
        </span>
        <DivisionSeal divisionId={divisionId} size={28} compact />
      </div>
    </header>
  )
}

/**
 * Ecrãs que trazem cabeçalho próprio. Nestes, a barra partilhada sai da
 * frente: o cabeçalho faz parte da composição do ecrã (o medalhão do Quartel,
 * a data das Rações) e duplicá-lo só roubava altura ao conteúdo.
 */
const SELF_HEADER_ROUTES = new Set(['/', '/treino', '/nutricao', '/missoes', '/perfil'])

export function AppShell() {
  const { pathname } = useLocation()
  const ownsHeader = SELF_HEADER_ROUTES.has(pathname)

  return (
    // O projeto de iOS permite as duas orientações e em horizontal o notch come
    // uma faixa de um dos lados; sem estes insets o texto dos ecrãs ficava por
    // baixo dele. Em vertical valem zero e nada muda.
    <div className="min-h-dvh pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
      <Sidebar />
      {!ownsHeader && <MobileHeader />}
      {/*
        O fim do conteúdo é a altura da barra mais 1 rem de respiro. Antes era
        um `7rem` escrito à mão que já não batia certo com a barra; agora sai
        de `--tab-bar`, por isso mexer na barra chega para os dois ficarem
        coerentes. Dá 100 px num 16 Pro Max — 16 px de folga acima da barra.
      */}
      <main
        className={cn(
          'pb-[calc(var(--tab-bar)+1rem)] md:ml-64 md:px-8 md:pb-10 md:pt-8',
          // Os ecrãs com cabeçalho próprio tratam do espaçamento de topo e das
          // margens laterais, porque a arte de fundo tem de correr de bordo a
          // bordo; os outros recebem-nos aqui.
          ownsHeader ? '' : 'px-4 pt-4',
        )}
      >
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { getCosmetic } from '@/data/cosmetics'
import { useI18n } from '@/i18n'
import { levelFromXp, titleKeyForLevel } from '@/services/calculations'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/Progress'
import { useGameStore } from '@/store/gameStore'
import { useUserStore } from '@/store/userStore'
import type { Dictionary } from '@/i18n'

function navItems(t: Dictionary) {
  return [
    { to: '/', label: t.nav.home, icon: 'Home', end: true },
    { to: '/treino', label: t.nav.workout, icon: 'Dumbbell', end: false },
    { to: '/nutricao', label: t.nav.nutrition, icon: 'UtensilsCrossed', end: false },
    { to: '/missoes', label: t.nav.quests, icon: 'Target', end: false },
    { to: '/perfil', label: t.nav.profile, icon: 'User', end: false },
  ]
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-ember to-crimson">
        <Icon name="Zap" size={19} className="text-void-950" strokeWidth={2.5} />
      </span>
      <span className="font-display text-2xl font-bold tracking-[0.22em] text-ink">ASCEND</span>
    </div>
  )
}

/** Título ativo: o cosmético equipado tem precedência sobre o título do nível. */
export function useHeroTitle(level: number): string {
  const { t, loc } = useI18n()
  const equippedTitle = useGameStore((state) => state.equipped.title)
  const cosmetic = equippedTitle ? getCosmetic(equippedTitle) : undefined
  return cosmetic ? loc(cosmetic.name) : t.levelTitles[titleKeyForLevel(level)]
}

function LevelCard() {
  const { t, n } = useI18n()
  const xp = useGameStore((state) => state.xp)
  const coins = useGameStore((state) => state.coins)
  const info = levelFromXp(xp)
  const title = useHeroTitle(info.level)

  return (
    <div className="rounded-xl border border-void-600/70 bg-void-800/60 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-crimson to-ember font-display text-sm font-bold text-void-950">
            {info.level}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-muted">{t.common.levelWithNumber(info.level)}</p>
            <p className="truncate text-[11px] text-ink-faint">{title}</p>
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
      <p className="mt-1.5 text-right text-[11px] tabular-nums text-ink-faint">
        {t.common.xpProgress(n(info.currentLevelXp), n(info.nextLevelXp))}
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
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3 p-3">
        {name && <LevelCard />}
        <p className="px-1 text-[11px] leading-relaxed text-ink-faint">{t.app.localDataNote}</p>
      </div>
    </aside>
  )
}

function BottomNav() {
  const { t } = useI18n()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-void-700 bg-void-850/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label={t.app.mainNav}
    >
      <div className="flex">
        {navItems(t).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-ember' : 'text-ink-faint hover:text-ink-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-xl transition-colors',
                    isActive && 'bg-ember/15',
                  )}
                >
                  <Icon name={item.icon} size={19} />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function MobileHeader() {
  const { n } = useI18n()
  const xp = useGameStore((state) => state.xp)
  const coins = useGameStore((state) => state.coins)
  const streak = useGameStore((state) => state.streak)
  const info = levelFromXp(xp)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-void-700/70 bg-void-900/90 px-4 py-3 backdrop-blur-xl md:hidden">
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
        <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-crimson to-ember font-display text-xs font-bold text-void-950">
          {info.level}
        </span>
      </div>
    </header>
  )
}

export function AppShell() {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileHeader />
      <main className="px-4 pb-28 pt-4 md:ml-64 md:px-8 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

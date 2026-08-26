import { NavLink, Outlet } from 'react-router-dom'
import { levelFromXp, titleForLevel } from '@/services/calculations'
import { getCosmetic } from '@/data/cosmetics'
import { cn, formatNumber } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/Progress'
import { useGameStore } from '@/store/gameStore'
import { useUserStore } from '@/store/userStore'

const NAV_ITEMS = [
  { to: '/', label: 'Base', icon: 'Home', end: true },
  { to: '/treino', label: 'Treino', icon: 'Dumbbell', end: false },
  { to: '/nutricao', label: 'Nutrição', icon: 'UtensilsCrossed', end: false },
  { to: '/missoes', label: 'Missões', icon: 'Target', end: false },
  { to: '/perfil', label: 'Perfil', icon: 'User', end: false },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-electric to-violet-deep">
        <Icon name="Zap" size={19} className="text-night-950" strokeWidth={2.5} />
      </span>
      <span className="font-display text-2xl font-bold tracking-widest text-ink">ASCEND</span>
    </div>
  )
}

function LevelCard() {
  const xp = useGameStore((state) => state.xp)
  const coins = useGameStore((state) => state.coins)
  const equippedTitle = useGameStore((state) => state.equipped.title)
  const info = levelFromXp(xp)
  const title = equippedTitle ? (getCosmetic(equippedTitle)?.value ?? titleForLevel(info.level)) : titleForLevel(info.level)

  return (
    <div className="rounded-xl border border-night-600/70 bg-night-800/60 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-deep to-cyan-electric font-display text-sm font-bold text-night-950">
            {info.level}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-muted">Nível {info.level}</p>
            <p className="truncate text-[11px] text-ink-faint">{title}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold tabular-nums text-gold">
          <Icon name="Coins" size={13} />
          {formatNumber(coins)}
        </span>
      </div>
      <ProgressBar
        value={info.currentLevelXp}
        max={info.nextLevelXp}
        tone="xp"
        height="sm"
        className="mt-3"
        label="Progresso de nível"
        showShimmer
      />
      <p className="mt-1.5 text-right text-[11px] tabular-nums text-ink-faint">
        {formatNumber(info.currentLevelXp)} / {formatNumber(info.nextLevelXp)} XP
      </p>
    </div>
  )
}

function Sidebar() {
  const name = useUserStore((state) => state.profile?.name)
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-night-700/70 bg-night-850/80 backdrop-blur-xl md:flex">
      <div className="px-5 py-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-cyan-electric/15 to-transparent text-cyan-electric shadow-[inset_2px_0_0_0_var(--color-cyan-electric)]'
                  : 'text-ink-muted hover:bg-night-700/60 hover:text-ink',
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
        <p className="px-1 text-[11px] leading-relaxed text-ink-faint">
          Os dados ficam guardados apenas neste dispositivo.
        </p>
      </div>
    </aside>
  )
}

function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-night-700 bg-night-850/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Navegação principal"
    >
      <div className="flex">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-cyan-electric' : 'text-ink-faint hover:text-ink-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-xl transition-colors',
                    isActive && 'bg-cyan-electric/12',
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
  const xp = useGameStore((state) => state.xp)
  const coins = useGameStore((state) => state.coins)
  const streak = useGameStore((state) => state.streak)
  const info = levelFromXp(xp)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-night-700/70 bg-night-900/85 px-4 py-3 backdrop-blur-xl md:hidden">
      <Logo />
      <div className="flex items-center gap-2.5 text-xs font-semibold tabular-nums">
        <span className="flex items-center gap-1 text-warn">
          <Icon name="Flame" size={14} />
          {streak}
        </span>
        <span className="flex items-center gap-1 text-gold">
          <Icon name="Coins" size={14} />
          {formatNumber(coins)}
        </span>
        <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-deep to-cyan-electric font-display text-xs font-bold text-night-950">
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

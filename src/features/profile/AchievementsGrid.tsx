import { ArtIcon } from '@/components/ArtIcon'
import { ACHIEVEMENTS } from '@/data/achievements'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { ProgressBar } from '@/components/ui/Progress'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { levelFromXp } from '@/services/calculations'
import { formatShortDate } from '@/services/dates'
import { useGameStore } from '@/store/gameStore'
import type { ArtIconName } from '@/data/artIcons'

/** Emblema ilustrativo por conquista, usado como marca de água do cartão. */
const ACHIEVEMENT_EMBLEM: Record<string, ArtIconName> = {
  'primeiro-passo': 'torii',
  'chama-acesa': 'fire-silhouette',
  'semana-de-ferro': 'flame-spin',
  'guerreiro-dedicado': 'katana',
  'mestre-proteina': 'kimono',
  ascensao: 'feathered-wing',
  'cacador-missoes': 'energy-sword',
  'chef-heroi': 'burning-embers',
  arquiteto: 'cross-flare',
  observador: 'moon',
}

export function AchievementsGrid() {
  const { t, loc } = useI18n()
  const unlocked = useGameStore((state) => state.unlockedAchievements)
  const counters = useGameStore((state) => state.counters)
  const streak = useGameStore((state) => state.streak)
  const bestStreak = useGameStore((state) => state.bestStreak)
  const xp = useGameStore((state) => state.xp)

  const metrics: Record<string, number> = {
    workouts: counters.workouts,
    streak: Math.max(streak, bestStreak),
    level: levelFromXp(xp).level,
    proteinDays: counters.proteinDays,
    quests: counters.quests,
    meals: counters.meals,
    customWorkouts: counters.customWorkouts,
    weightLogs: counters.weightLogs,
  }

  const unlockedCount = Object.keys(unlocked).length

  return (
    <Card>
      <CardHeader
        title={t.profile.achievementsTitle}
        subtitle={t.profile.achievementsSubtitle(unlockedCount, ACHIEVEMENTS.length)}
        icon="Trophy"
        action={
          <Badge tone="gold" icon="Star">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </Badge>
        }
      />
      <CardBody className="pt-3">
        <ul className="grid gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => {
            const unlockedAt = unlocked[achievement.id]
            const progress = Math.min(metrics[achievement.metric] ?? 0, achievement.target)

            return (
              <li
                key={achievement.id}
                className={cn(
                  'relative overflow-hidden rounded-xl border p-4 transition-colors',
                  unlockedAt ? 'border-gold/45 bg-gold/5' : 'border-void-600 bg-void-800/40',
                )}
              >
                {/* Emblema ilustrativo, mais presente quando a conquista está ganha. */}
                <span
                  className={cn(
                    'pointer-events-none absolute -bottom-6 -right-4 rotate-6',
                    unlockedAt ? 'text-gold/[0.13]' : 'text-ink/[0.04]',
                  )}
                  aria-hidden="true"
                >
                  <ArtIcon name={ACHIEVEMENT_EMBLEM[achievement.id] ?? 'aura'} size={112} />
                </span>

                <div className="relative flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl',
                      unlockedAt ? 'bg-gold/15 text-gold' : 'bg-void-700 text-ink-faint',
                    )}
                  >
                    <Icon name={unlockedAt ? achievement.icon : 'Lock'} size={21} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('font-semibold', unlockedAt ? 'text-gold-soft' : 'text-ink-muted')}>
                      {loc(achievement.title)}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{loc(achievement.description)}</p>

                    {unlockedAt ? (
                      <p className="mt-2 text-xs text-gold/80">{t.profile.unlockedOn(formatShortDate(unlockedAt))}</p>
                    ) : (
                      <div className="mt-2.5 space-y-1">
                        <ProgressBar
                          value={progress}
                          max={achievement.target}
                          tone="crimson"
                          height="sm"
                          label={loc(achievement.title)}
                        />
                        <p className="text-right text-[11px] tabular-nums text-ink-faint">
                          {progress} / {achievement.target}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardBody>
    </Card>
  )
}

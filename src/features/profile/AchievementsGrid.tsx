import { ACHIEVEMENTS } from '@/data/achievements'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { ProgressBar } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'
import { levelFromXp } from '@/services/calculations'
import { formatShortDate } from '@/services/dates'
import { useGameStore } from '@/store/gameStore'

export function AchievementsGrid() {
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
        title="Conquistas"
        subtitle={`${unlockedCount} de ${ACHIEVEMENTS.length} desbloqueadas`}
        icon="Trophy"
        action={<Badge tone="gold" icon="Star">{unlockedCount}/{ACHIEVEMENTS.length}</Badge>}
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
                  'rounded-xl border p-4 transition-colors',
                  unlockedAt ? 'border-gold/45 bg-gold/5' : 'border-night-600 bg-night-800/40',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl',
                      unlockedAt ? 'bg-gold/15 text-gold' : 'bg-night-700 text-ink-faint',
                    )}
                  >
                    <Icon name={unlockedAt ? achievement.icon : 'Lock'} size={21} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('font-semibold', unlockedAt ? 'text-gold-soft' : 'text-ink-muted')}>
                      {achievement.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{achievement.description}</p>

                    {unlockedAt ? (
                      <p className="mt-2 text-xs text-gold/80">Desbloqueada a {formatShortDate(unlockedAt)}</p>
                    ) : (
                      <div className="mt-2.5 space-y-1">
                        <ProgressBar
                          value={progress}
                          max={achievement.target}
                          tone="violet"
                          height="sm"
                          label={achievement.title}
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

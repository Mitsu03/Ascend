import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EXERCISE_BY_ID } from '@/data/exercises'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, EmptyState } from '@/components/ui/Misc'
import { ConfirmDialog } from '@/components/ui/Modal'
import { CustomWorkoutModal } from '@/features/workout/CustomWorkoutModal'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { dayOfWeek, formatShortDate, today, weekDates } from '@/services/dates'
import { estimateDuration, totalSets } from '@/services/planGenerator'
import { useWorkoutStore } from '@/store/workoutStore'
import type { WorkoutDay } from '@/types'

function WeeklyCalendar({
  selectedDay,
  onSelect,
}: {
  selectedDay: number
  onSelect: (day: number) => void
}) {
  const { t } = useI18n()
  const plan = useWorkoutStore((state) => state.plan)
  const isCompletedOn = useWorkoutStore((state) => state.isCompletedOn)
  const dates = weekDates(today())
  const currentDay = dayOfWeek(today())

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {dates.map((date) => {
        const weekday = dayOfWeek(date)
        const workout = plan.find((day) => day.dayOfWeek === weekday)
        const done = workout ? isCompletedOn(workout.id, date) : false
        const isToday = weekday === currentDay
        const isSelected = weekday === selectedDay

        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(weekday)}
            aria-pressed={isSelected}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border p-2 transition-all duration-150 sm:p-3',
              isSelected
                ? 'border-ember/70 bg-ember/10'
                : 'border-void-600 bg-void-800/50 hover:border-void-500',
              isToday && !isSelected && 'ring-1 ring-inset ring-ember/40',
            )}
          >
            <span className="text-[11px] font-medium text-ink-muted">{t.weekdays.short[weekday]}</span>
            <span className={cn('font-display text-lg font-bold', isSelected ? 'text-ember' : 'text-ink')}>
              {formatShortDate(date).split(' ')[0]}
            </span>
            {workout ? (
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full',
                  done ? 'bg-good/20 text-good' : 'bg-crimson/40 text-crimson-soft',
                )}
              >
                <Icon name={done ? 'Check' : 'Dumbbell'} size={11} />
              </span>
            ) : (
              <span className="flex size-5 items-center justify-center text-ink-faint">
                <Icon name="Moon" size={11} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function WorkoutDetail({ workout }: { workout: WorkoutDay }) {
  const navigate = useNavigate()
  const { t, loc } = useI18n()
  const startSession = useWorkoutStore((state) => state.startSession)
  const removeWorkout = useWorkoutStore((state) => state.removeWorkout)
  const isCompletedOn = useWorkoutStore((state) => state.isCompletedOn)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const done = isCompletedOn(workout.id, today())

  return (
    <Card glow={done ? 'none' : 'ember'}>
      <CardHeader
        title={loc(workout.name)}
        subtitle={loc(workout.focus)}
        icon="Dumbbell"
        action={
          <div className="flex items-center gap-2">
            {done && <Badge tone="good" icon="CheckCircle2">{t.workout.doneToday}</Badge>}
            {workout.isCustom && (
              <IconButton
                icon="Trash2"
                label={t.workout.deleteAria}
                size="sm"
                onClick={() => setConfirmRemove(true)}
              />
            )}
          </div>
        }
      />
      <CardBody className="space-y-4 pt-3">
        <div className="flex flex-wrap gap-2">
          <Badge icon="ListChecks">{t.workout.exercises(workout.exercises.length)}</Badge>
          <Badge icon="Activity">{t.workout.sets(totalSets(workout.exercises))}</Badge>
          <Badge icon="Timer">{t.workout.approxMinutes(estimateDuration(workout.exercises))}</Badge>
          <Badge tone="crimson" icon="Star">{t.levels[workout.difficulty]}</Badge>
          {workout.isCustom && <Badge tone="gold" icon="Hammer">{t.workout.custom}</Badge>}
        </div>

        <ul className="space-y-2">
          {workout.exercises.map((item) => {
            const exercise = EXERCISE_BY_ID[item.exerciseId]
            const open = expanded === item.exerciseId
            return (
              <li key={item.exerciseId} className="rounded-xl border border-void-600 bg-void-800/40">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : item.exerciseId)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 p-3.5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">
                      {exercise ? loc(exercise.name) : item.exerciseId}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                      <span>{exercise ? t.muscles[exercise.muscleGroup] : ''}</span>
                      {exercise && <span>· {t.equipment[exercise.equipment]}</span>}
                      {item.restSeconds > 0 && <span>· {t.workout.restSeconds(item.restSeconds)}</span>}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-lg font-bold tabular-nums text-ember">
                      {item.sets} × {item.reps}
                    </span>
                  </span>
                  <Icon name={open ? 'ChevronDown' : 'ChevronRight'} size={16} className="shrink-0 text-ink-faint" />
                </button>
                {open && exercise && (
                  <p className="border-t border-void-700 px-3.5 py-3 text-sm leading-relaxed text-ink-muted">
                    {loc(exercise.description)}
                  </p>
                )}
              </li>
            )
          })}
        </ul>

        <Button
          variant="primary"
          size="lg"
          icon="Play"
          fullWidth
          onClick={() => {
            startSession(workout.id)
            navigate('/treino/sessao')
          }}
        >
          {done ? t.workout.repeat : t.workout.start}
        </Button>
      </CardBody>

      <ConfirmDialog
        open={confirmRemove}
        title={t.workout.deleteTitle}
        message={t.workout.deleteMessage(loc(workout.name))}
        confirmLabel={t.common.delete}
        destructive
        onCancel={() => setConfirmRemove(false)}
        onConfirm={() => {
          removeWorkout(workout.id)
          setConfirmRemove(false)
        }}
      />
    </Card>
  )
}

function HistoryCard() {
  const { t, loc } = useI18n()
  const history = useWorkoutStore((state) => state.history)
  const recent = history.slice(0, 6)

  return (
    <Card>
      <CardHeader
        title={t.workout.recentSessions}
        subtitle={t.workout.sessionsLogged(history.length)}
        icon="Clock"
      />
      <CardBody className="pt-3">
        {recent.length === 0 ? (
          <EmptyState icon="Clock" title={t.workout.noHistory} message={t.workout.noHistoryText} />
        ) : (
          <ul className="space-y-2">
            {recent.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-void-600 bg-void-800/40 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{loc(log.workoutName)}</p>
                  <p className="text-xs text-ink-faint">
                    {t.workout.sessionSummary(
                      formatShortDate(log.date),
                      log.completedSets,
                      log.totalSets,
                      Math.round(log.durationSeconds / 60),
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ember">
                  +{log.xpEarned} {t.common.xp}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}

export function WorkoutPage() {
  const { t } = useI18n()
  const plan = useWorkoutStore((state) => state.plan)
  const [selectedDay, setSelectedDay] = useState(dayOfWeek(today()))
  const [creating, setCreating] = useState(false)

  const workouts = useMemo(() => plan.filter((day) => day.dayOfWeek === selectedDay), [plan, selectedDay])

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="slash-divider text-3xl font-bold text-ink">{t.workout.title}</h1>
          <p className="mt-3 text-ink-muted">{t.workout.planCount(plan.length)}</p>
        </div>
        <Button variant="secondary" icon="Hammer" onClick={() => setCreating(true)}>
          {t.workout.createWorkout}
        </Button>
      </header>

      <Card>
        <CardHeader title={t.workout.weeklyPlan} subtitle={t.workout.pickDay} icon="CalendarDays" />
        <CardBody className="pt-3">
          <WeeklyCalendar selectedDay={selectedDay} onSelect={setSelectedDay} />
        </CardBody>
      </Card>

      {workouts.length > 0 ? (
        <div className="space-y-5">
          {workouts.map((workout) => (
            <WorkoutDetail key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="Moon"
            title={t.workout.restDayTitle}
            message={t.workout.restDayText}
            action={
              <Button variant="primary" icon="Hammer" onClick={() => setCreating(true)}>
                {t.workout.createForDay}
              </Button>
            }
          />
        </Card>
      )}

      <HistoryCard />

      <CustomWorkoutModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}

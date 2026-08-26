import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EQUIPMENT_LABELS, EXERCISE_BY_ID, MUSCLE_LABELS } from '@/data/exercises'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, EmptyState } from '@/components/ui/Misc'
import { ConfirmDialog } from '@/components/ui/Modal'
import { CustomWorkoutModal } from '@/features/workout/CustomWorkoutModal'
import { cn } from '@/lib/cn'
import { WEEKDAY_SHORT, dayOfWeek, formatShortDate, today, weekDates } from '@/services/dates'
import { estimateDuration, totalSets } from '@/services/planGenerator'
import { useWorkoutStore } from '@/store/workoutStore'
import type { WorkoutDay } from '@/types'

const DIFFICULTY_LABELS = {
  iniciante: 'Iniciante',
  intermedio: 'Intermédio',
  avancado: 'Avançado',
} as const

function WeeklyCalendar({
  selectedDay,
  onSelect,
}: {
  selectedDay: number
  onSelect: (day: number) => void
}) {
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
                ? 'border-cyan-electric/70 bg-cyan-electric/10'
                : 'border-night-600 bg-night-800/50 hover:border-night-500',
              isToday && !isSelected && 'ring-1 ring-inset ring-cyan-electric/40',
            )}
          >
            <span className="text-[11px] font-medium text-ink-muted">{WEEKDAY_SHORT[weekday]}</span>
            <span className={cn('font-display text-lg font-bold', isSelected ? 'text-cyan-electric' : 'text-ink')}>
              {formatShortDate(date).split(' ')[0]}
            </span>
            {workout ? (
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full',
                  done ? 'bg-good/20 text-good' : 'bg-violet-deep/30 text-violet-soft',
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
  const startSession = useWorkoutStore((state) => state.startSession)
  const removeWorkout = useWorkoutStore((state) => state.removeWorkout)
  const isCompletedOn = useWorkoutStore((state) => state.isCompletedOn)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const done = isCompletedOn(workout.id, today())

  return (
    <Card glow={done ? 'none' : 'cyan'}>
      <CardHeader
        title={workout.name}
        subtitle={workout.focus}
        icon="Dumbbell"
        action={
          <div className="flex items-center gap-2">
            {done && <Badge tone="good" icon="CheckCircle2">Feito hoje</Badge>}
            {workout.isCustom && (
              <IconButton icon="Trash2" label="Eliminar treino" size="sm" onClick={() => setConfirmRemove(true)} />
            )}
          </div>
        }
      />
      <CardBody className="space-y-4 pt-3">
        <div className="flex flex-wrap gap-2">
          <Badge icon="ListChecks">{workout.exercises.length} exercícios</Badge>
          <Badge icon="Activity">{totalSets(workout.exercises)} séries</Badge>
          <Badge icon="Timer">≈ {estimateDuration(workout.exercises)} min</Badge>
          <Badge tone="violet" icon="Star">{DIFFICULTY_LABELS[workout.difficulty]}</Badge>
          {workout.isCustom && <Badge tone="gold" icon="Hammer">Personalizado</Badge>}
        </div>

        <ul className="space-y-2">
          {workout.exercises.map((item) => {
            const exercise = EXERCISE_BY_ID[item.exerciseId]
            const open = expanded === item.exerciseId
            return (
              <li key={item.exerciseId} className="rounded-xl border border-night-600 bg-night-800/40">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : item.exerciseId)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 p-3.5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{exercise?.name ?? item.exerciseId}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                      <span>{exercise ? MUSCLE_LABELS[exercise.muscleGroup] : ''}</span>
                      {exercise && <span>· {EQUIPMENT_LABELS[exercise.equipment]}</span>}
                      {item.restSeconds > 0 && <span>· {item.restSeconds}s descanso</span>}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-lg font-bold tabular-nums text-cyan-electric">
                      {item.sets} × {item.reps}
                    </span>
                  </span>
                  <Icon name={open ? 'ChevronDown' : 'ChevronRight'} size={16} className="shrink-0 text-ink-faint" />
                </button>
                {open && exercise && (
                  <p className="border-t border-night-700 px-3.5 py-3 text-sm leading-relaxed text-ink-muted">
                    {exercise.description}
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
          {done ? 'Repetir treino' : 'Iniciar treino'}
        </Button>
      </CardBody>

      <ConfirmDialog
        open={confirmRemove}
        title="Eliminar treino?"
        message={`"${workout.name}" será removido do teu plano. O histórico de sessões já feitas mantém-se.`}
        confirmLabel="Eliminar"
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
  const history = useWorkoutStore((state) => state.history)
  const recent = history.slice(0, 6)

  return (
    <Card>
      <CardHeader title="Sessões recentes" subtitle={`${history.length} treinos registados`} icon="Clock" />
      <CardBody className="pt-3">
        {recent.length === 0 ? (
          <EmptyState icon="Clock" title="Sem histórico" message="Assim que terminares o primeiro treino, ele aparece aqui." />
        ) : (
          <ul className="space-y-2">
            {recent.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-night-600 bg-night-800/40 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{log.workoutName}</p>
                  <p className="text-xs text-ink-faint">
                    {formatShortDate(log.date)} · {log.completedSets}/{log.totalSets} séries ·{' '}
                    {Math.round(log.durationSeconds / 60)} min
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-cyan-electric">
                  +{log.xpEarned} XP
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
  const plan = useWorkoutStore((state) => state.plan)
  const [selectedDay, setSelectedDay] = useState(dayOfWeek(today()))
  const [creating, setCreating] = useState(false)

  const workouts = useMemo(
    () => plan.filter((day) => day.dayOfWeek === selectedDay),
    [plan, selectedDay],
  )

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Treino</h1>
          <p className="mt-1 text-ink-muted">
            {plan.length} {plan.length === 1 ? 'treino' : 'treinos'} no plano semanal
          </p>
        </div>
        <Button variant="secondary" icon="Hammer" onClick={() => setCreating(true)}>
          Criar treino
        </Button>
      </header>

      <Card>
        <CardHeader title="Plano semanal" subtitle="Escolhe um dia para ver o treino" icon="CalendarDays" />
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
            title="Dia de descanso"
            message="Não há treino planeado para este dia. O descanso faz parte do progresso — mas podes criar um treino se te apetecer."
            action={
              <Button variant="primary" icon="Hammer" onClick={() => setCreating(true)}>
                Criar treino para este dia
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

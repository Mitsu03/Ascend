import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EXERCISE_BY_ID } from '@/data/exercises'
import { ScreenBackdrop } from '@/components/layout/ScreenBackdrop'
import { ScreenHeader, ScreenTitle } from '@/components/layout/ScreenHeader'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, EmptyState } from '@/components/ui/Misc'
import { ConfirmDialog } from '@/components/ui/Modal'
import { CustomWorkoutModal } from '@/features/workout/CustomWorkoutModal'
import { ExerciseDemo } from '@/features/workout/ExerciseDemo'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { dayOfWeek, formatShortDate, today, weekDates } from '@/services/dates'
import { estimateDuration, totalSets } from '@/services/planGenerator'
import { useWorkoutStore } from '@/store/workoutStore'
import type { WorkoutDay } from '@/types'

/**
 * A tira dos sete dias. Cada dia diz três coisas de uma vez: se tem treino
 * (fundo), se é hoje (moldura acesa) e se já foi feito (ponto verde) — por isso
 * a semana lê-se sem se tocar em nada.
 */
function WeekStrip({ selectedDay, onSelect }: { selectedDay: number; onSelect: (day: number) => void }) {
  const { t } = useI18n()
  const plan = useWorkoutStore((state) => state.plan)
  const isCompletedOn = useWorkoutStore((state) => state.isCompletedOn)
  const dates = weekDates(today())
  const currentDay = dayOfWeek(today())

  return (
    <div className="mt-3 flex gap-[5px]">
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
            aria-label={formatShortDate(date)}
            className={cn(
              'flex flex-1 flex-col items-center gap-[5px] rounded-[11px] border py-2 transition-colors',
              isToday || isSelected ? 'border-ember/70 bg-ember/10' : 'border-void-600',
              !isToday && !isSelected && (workout ? 'bg-void-800' : 'bg-transparent'),
            )}
          >
            <span
              className={cn(
                'text-[10px] font-semibold',
                isToday || isSelected ? 'text-ember' : workout ? 'text-ink' : 'text-ink-muted',
              )}
            >
              {t.weekdays.short[weekday]}
            </span>
            <span
              className={cn(
                'flex size-[17px] items-center justify-center rounded-full text-[9px] font-bold',
                !workout && 'text-ink-muted',
                workout && (done ? 'bg-good/20 text-good' : 'bg-crimson/35 text-crimson-soft'),
              )}
              aria-hidden="true"
            >
              {workout ? (done ? '✓' : '') : '·'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Cartão do treino escolhido: o mesmo vocabulário do herói do Quartel. */
function WorkoutCard({ workout }: { workout: WorkoutDay }) {
  const navigate = useNavigate()
  const { t, loc } = useI18n()
  const startSession = useWorkoutStore((state) => state.startSession)
  const removeWorkout = useWorkoutStore((state) => state.removeWorkout)
  const isCompletedOn = useWorkoutStore((state) => state.isCompletedOn)
  const activeSession = useWorkoutStore((state) => state.activeSession)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const done = isCompletedOn(workout.id, today())
  const resuming = activeSession?.workoutDayId === workout.id

  const label = resuming ? t.workout.resumeSession : done ? t.workout.repeatSession : t.workout.startSession

  return (
    <section
      className="edge-glint relative overflow-hidden rounded-[20px] border border-ember/40 p-[18px]"
      style={{ background: 'linear-gradient(165deg,#181820,#0d0d13)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10.5px] font-bold tracking-[0.22em] text-ember-soft">{t.workout.todaysWorkout}</p>
        <div className="flex shrink-0 items-center gap-2">
          {done && (
            <Badge tone="good" icon="CheckCircle2">
              {t.workout.doneToday}
            </Badge>
          )}
          {workout.isCustom && (
            <IconButton icon="Trash2" label={t.workout.deleteAria} size="sm" onClick={() => setConfirmRemove(true)} />
          )}
        </div>
      </div>

      <h1 className="mt-[7px] font-display text-[32px] leading-[1.05] font-bold text-ink [text-shadow:3px_3px_0_rgba(184,18,54,.5)]">
        {loc(workout.name)}
      </h1>
      <p className="mt-1 text-[12.5px] font-semibold text-ember-soft">{loc(workout.focus)}</p>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-void-700 px-[9px] py-1 text-[10.5px] font-semibold text-ink">
          {t.workout.exercises(workout.exercises.length)}
        </span>
        <span className="rounded-full bg-void-700 px-[9px] py-1 text-[10.5px] font-semibold text-ink">
          {t.workout.sets(totalSets(workout.exercises))}
        </span>
        <span className="rounded-full bg-void-700 px-[9px] py-1 text-[10.5px] font-semibold text-ink">
          {t.workout.approxMinutes(estimateDuration(workout.exercises))}
        </span>
        <span className="rounded-full bg-crimson-soft/[0.16] px-[9px] py-1 text-[10.5px] font-semibold text-ember-soft">
          {t.levels[workout.difficulty]}
        </span>
        {workout.isCustom && (
          <span className="rounded-full bg-gold/[0.16] px-[9px] py-1 text-[10.5px] font-semibold text-gold-soft">
            {t.workout.custom}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (!resuming) startSession(workout.id)
          navigate('/treino/sessao')
        }}
        // `void-950` pelos 3:1 sobre o extremo carmim do gradiente — ver a nota
        // do botão gémeo em `WorkoutSessionPage`.
        className="mt-4 h-[54px] w-full rounded-[14px] bg-gradient-to-br from-ember to-crimson font-display text-[18px] font-bold tracking-[0.05em] text-void-950 shadow-[0_12px_30px_-10px_rgba(255,122,26,.85)] transition-opacity active:opacity-90"
      >
        {label}
      </button>

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
    </section>
  )
}

/** Lista de exercícios do treino. Abre para mostrar descrição e demonstração. */
function ExerciseList({ workout }: { workout: WorkoutDay }) {
  const { t, loc } = useI18n()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      <p className="mt-5 text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">{t.workout.exercisesHeading}</p>
      <ul className="mt-2.5 flex flex-col gap-[7px]">
        {workout.exercises.map((item) => {
          const exercise = EXERCISE_BY_ID[item.exerciseId]
          const open = expanded === item.exerciseId

          return (
            <li key={item.exerciseId} className="overflow-hidden rounded-[13px] border border-void-600 bg-void-800">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : item.exerciseId)}
                aria-expanded={open}
                className="flex w-full items-center gap-2.5 px-[13px] py-3 text-left"
              >
                {/*
                  Nome e ficha técnica cortavam a uma linha. Em português a
                  ficha é mais comprida — «Corpo inteiro · Sem equipamento ·
                  descanso 90 s» pede 245 px e tinha 223, e o tempo de descanso
                  ficava sempre de fora. Quebram as duas: o exercício é o que se
                  vem aqui ler.
                */}
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink">
                    {exercise ? loc(exercise.name) : item.exerciseId}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-ink-muted">
                    {exercise
                      ? t.workout.exerciseMeta(
                          t.muscles[exercise.muscleGroup],
                          t.equipment[exercise.equipment],
                          item.restSeconds,
                        )
                      : ''}
                  </span>
                </span>
                <span className="shrink-0 font-display text-[16px] font-bold tabular-nums text-ember-soft">
                  {item.sets} × {item.reps}
                </span>
                <Icon
                  name={open ? 'ChevronDown' : 'ChevronRight'}
                  size={13}
                  className="shrink-0 text-ink-muted"
                />
              </button>

              {open && exercise && (
                <div className="space-y-3 border-t border-void-700 px-[13px] pt-[11px] pb-[13px]">
                  <p className="text-xs leading-[1.6] text-ink-muted">{loc(exercise.description)}</p>
                  <ExerciseDemo exerciseId={exercise.id} exerciseName={loc(exercise.name)} className="max-w-sm" />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

/** Histórico recente — não vem do protótipo, mas a app regista-o e é útil. */
function HistoryCard() {
  const { t, loc } = useI18n()
  const history = useWorkoutStore((state) => state.history)
  const recent = history.slice(0, 6)

  return (
    <Card className="mt-5 rounded-[18px] border-void-700/90 bg-void-825">
      <CardHeader title={t.workout.recentSessions} subtitle={t.workout.sessionsLogged(history.length)} icon="Clock" />
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
    <>
      <ScreenBackdrop screen="dojo" />

      <ScreenHeader className="flex-col items-stretch">
        <ScreenTitle>{t.workout.dojoSubtitle}</ScreenTitle>
        <WeekStrip selectedDay={selectedDay} onSelect={setSelectedDay} />
      </ScreenHeader>

      <div className="hidden flex-wrap items-end justify-between gap-4 md:flex">
        <div>
          <h1 className="slash-divider font-display text-3xl font-bold text-ink">{t.workout.title}</h1>
          <p className="mt-3.5 text-sm text-ink-muted">{t.workout.planCount(plan.length)}</p>
        </div>
        <Button variant="secondary" icon="Hammer" onClick={() => setCreating(true)}>
          {t.workout.createWorkout}
        </Button>
      </div>

      <div className="px-5 pt-4 md:mt-6 md:px-0 md:pt-0">
        {/* Em desktop a tira da semana vive aqui, dentro do conteúdo. */}
        <div className="mb-5 hidden md:block">
          <WeekStrip selectedDay={selectedDay} onSelect={setSelectedDay} />
        </div>

        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <div key={workout.id} className="mb-5 last:mb-0">
              <WorkoutCard workout={workout} />
              <ExerciseList workout={workout} />
            </div>
          ))
        ) : (
          <Card className="rounded-[18px] border-void-700/90 bg-void-825">
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

        {/* Criar treino não cabe no protótipo, mas tem de haver forma em mobile. */}
        <Button variant="secondary" icon="Hammer" fullWidth className="mt-5 md:hidden" onClick={() => setCreating(true)}>
          {t.workout.createWorkout}
        </Button>

        <HistoryCard />
      </div>

      <CustomWorkoutModal open={creating} onClose={() => setCreating(false)} />
    </>
  )
}

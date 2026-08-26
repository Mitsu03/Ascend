import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EXERCISE_BY_ID, MUSCLE_LABELS } from '@/data/exercises'
import { Button, IconButton } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Misc'
import { ConfirmDialog } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/Progress'
import { CelebrationScreen } from '@/features/workout/CelebrationScreen'
import { cn } from '@/lib/cn'
import { formatDuration } from '@/services/dates'
import { useWorkoutStore } from '@/store/workoutStore'

function RestTimer({ seconds, onDismiss }: { seconds: number; onDismiss: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
    const id = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(id)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [seconds])

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md animate-rise rounded-2xl border border-cyan-electric/45 bg-night-850/95 p-4 shadow-2xl backdrop-blur md:bottom-8">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-electric/15 text-cyan-electric">
          <Icon name="Timer" size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            {remaining > 0 ? 'Descanso' : 'Pronto para a próxima série'}
          </p>
          <p className="font-display text-2xl font-bold tabular-nums text-cyan-electric">
            {formatDuration(remaining)}
          </p>
        </div>
        <Button size="sm" onClick={onDismiss}>
          {remaining > 0 ? 'Saltar' : 'Continuar'}
        </Button>
      </div>
      <ProgressBar value={seconds - remaining} max={seconds} tone="cyan" height="sm" className="mt-3" />
    </div>
  )
}

export function WorkoutSessionPage() {
  const navigate = useNavigate()
  const activeSession = useWorkoutStore((state) => state.activeSession)
  const plan = useWorkoutStore((state) => state.plan)
  const lastResult = useWorkoutStore((state) => state.lastResult)
  const toggleSet = useWorkoutStore((state) => state.toggleSet)
  const togglePause = useWorkoutStore((state) => state.togglePause)
  const finishSession = useWorkoutStore((state) => state.finishSession)
  const abandonSession = useWorkoutStore((state) => state.abandonSession)
  const clearLastResult = useWorkoutStore((state) => state.clearLastResult)

  const [elapsed, setElapsed] = useState(0)
  const [rest, setRest] = useState<{ seconds: number; key: number } | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const restKey = useRef(0)

  const workout = useMemo(
    () => (activeSession ? plan.find((day) => day.id === activeSession.workoutDayId) : undefined),
    [activeSession, plan],
  )

  useEffect(() => {
    if (!activeSession) return
    const tick = () => {
      const session = useWorkoutStore.getState().activeSession
      if (!session) return
      setElapsed(
        session.paused
          ? session.accumulatedSeconds
          : session.accumulatedSeconds + Math.floor((Date.now() - session.startedAt) / 1000),
      )
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [activeSession])

  // Sem sessão nem resultado por mostrar, não há nada nesta página.
  useEffect(() => {
    if (!activeSession && !lastResult) navigate('/treino', { replace: true })
  }, [activeSession, lastResult, navigate])

  if (lastResult && !activeSession) {
    return (
      <CelebrationScreen
        result={lastResult}
        onClose={() => {
          clearLastResult()
          navigate('/', { replace: true })
        }}
      />
    )
  }

  if (!activeSession || !workout) return null

  const completedSets = activeSession.checked.flat().filter(Boolean).length
  const total = activeSession.checked.flat().length

  const handleToggle = (exerciseIndex: number, setIndex: number, restSeconds: number) => {
    const wasChecked = activeSession.checked[exerciseIndex]?.[setIndex]
    toggleSet(exerciseIndex, setIndex)
    if (!wasChecked && restSeconds > 0) {
      restKey.current += 1
      setRest({ seconds: restSeconds, key: restKey.current })
    }
  }

  return (
    <div className="min-h-dvh pb-32">
      <header className="sticky top-0 z-30 border-b border-night-700 bg-night-900/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <IconButton icon="ArrowLeft" label="Sair do treino" onClick={() => setConfirmExit(true)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{workout.name}</p>
            <p className="truncate text-xs text-ink-faint">{workout.focus}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-display text-2xl font-bold tabular-nums',
                activeSession.paused ? 'text-ink-faint' : 'text-cyan-electric',
              )}
            >
              {formatDuration(elapsed)}
            </span>
            <IconButton
              icon={activeSession.paused ? 'Play' : 'Pause'}
              label={activeSession.paused ? 'Retomar cronómetro' : 'Pausar cronómetro'}
              onClick={togglePause}
            />
          </div>
        </div>
        <div className="mx-auto w-full max-w-3xl px-4 pb-3">
          <div className="flex items-center justify-between pb-1.5 text-xs text-ink-muted">
            <span>Progresso do treino</span>
            <span className="tabular-nums">
              {completedSets} / {total} séries
            </span>
          </div>
          <ProgressBar value={completedSets} max={total} tone="xp" height="md" showShimmer label="Progresso do treino" />
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-5">
        {workout.exercises.map((item, exerciseIndex) => {
          const exercise = EXERCISE_BY_ID[item.exerciseId]
          const checks = activeSession.checked[exerciseIndex] ?? []
          const doneHere = checks.filter(Boolean).length
          const allDone = doneHere === checks.length

          return (
            <section
              key={item.exerciseId}
              className={cn(
                'rounded-2xl border p-4 transition-colors',
                allDone ? 'border-good/40 bg-good/5' : 'border-night-600 bg-night-800/50',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className={cn('font-semibold', allDone ? 'text-good' : 'text-ink')}>
                    {exercise?.name ?? item.exerciseId}
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {exercise ? MUSCLE_LABELS[exercise.muscleGroup] : ''} · {item.sets} × {item.reps}
                    {item.restSeconds > 0 && ` · ${item.restSeconds}s descanso`}
                  </p>
                </div>
                {allDone && <Badge tone="good" icon="Check">Feito</Badge>}
              </div>

              {exercise && <p className="mt-2 text-xs leading-relaxed text-ink-muted">{exercise.description}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                {checks.map((checked, setIndex) => (
                  <button
                    key={setIndex}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={`Série ${setIndex + 1} de ${exercise?.name ?? 'exercício'}`}
                    onClick={() => handleToggle(exerciseIndex, setIndex, item.restSeconds)}
                    className={cn(
                      'flex h-11 min-w-16 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-all duration-150',
                      checked
                        ? 'border-good/50 bg-good/15 text-good'
                        : 'border-night-600 bg-night-900/60 text-ink-muted hover:border-cyan-electric/50 hover:text-ink',
                    )}
                  >
                    <Icon name={checked ? 'Check' : 'Circle'} size={15} />
                    {setIndex + 1}
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-night-700 bg-night-900/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl gap-2">
          <Button fullWidth onClick={() => setConfirmExit(true)}>
            Sair sem guardar
          </Button>
          <Button
            variant="primary"
            fullWidth
            icon="Check"
            onClick={() => {
              if (completedSets === 0) return
              if (completedSets < total) {
                setConfirmFinish(true)
                return
              }
              finishSession()
            }}
            disabled={completedSets === 0}
          >
            Terminar treino
          </Button>
        </div>
      </div>

      {rest && <RestTimer key={rest.key} seconds={rest.seconds} onDismiss={() => setRest(null)} />}

      <ConfirmDialog
        open={confirmExit}
        title="Sair do treino?"
        message="A sessão atual não será guardada e não ganhas XP. Podes retomá-la mais tarde se preferires não sair."
        confirmLabel="Sair"
        cancelLabel="Continuar treino"
        destructive
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => {
          abandonSession()
          navigate('/treino', { replace: true })
        }}
      />

      <ConfirmDialog
        open={confirmFinish}
        title="Terminar com séries por fazer?"
        message={`Completaste ${completedSets} de ${total} séries. Vais receber XP proporcional ao que fizeste — sem penalizações.`}
        confirmLabel="Terminar assim"
        cancelLabel="Voltar ao treino"
        onCancel={() => setConfirmFinish(false)}
        onConfirm={() => {
          setConfirmFinish(false)
          finishSession()
        }}
      />
    </div>
  )
}

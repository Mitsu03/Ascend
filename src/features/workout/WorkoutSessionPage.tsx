import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { ConfirmDialog } from '@/components/ui/Modal'
import { CelebrationScreen } from '@/features/workout/CelebrationScreen'
import { ExerciseDemo } from '@/features/workout/ExerciseDemo'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { formatDuration } from '@/services/dates'
import { useExerciseResolver } from '@/store/exerciseStore'
import { useWorkoutStore } from '@/store/workoutStore'

/**
 * Cartão de descanso. Aparece ao fechar uma série e conta para trás; o botão
 * de saltar existe porque quem está a treinar sabe melhor do que o relógio
 * quando está pronto.
 */
function RestCard({ seconds, onDismiss }: { seconds: number; onDismiss: () => void }) {
  const { t } = useI18n()
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

  const pct = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 0

  return (
    <div className="animate-pop relative mx-5 mb-3 rounded-2xl border border-crimson-soft/50 bg-void-800/95 p-3.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-ink-muted">{t.session.restCaption}</p>
          <p className="mt-0.5 font-display text-[30px] leading-none font-bold tabular-nums text-crimson-soft">
            {formatDuration(remaining)}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="h-11 shrink-0 rounded-[10px] border border-void-600 bg-void-700 px-4 text-xs font-semibold text-ink transition-opacity active:opacity-90"
        >
          {remaining > 0 ? t.session.skip : t.session.continue}
        </button>
      </div>
      <div className="mt-[11px] h-[5px] overflow-hidden rounded-full bg-void-700">
        <div className="h-full rounded-full bg-crimson-soft transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function WorkoutSessionPage() {
  const navigate = useNavigate()
  const { t, loc } = useI18n()
  const resolveExercise = useExerciseResolver()
  const activeSession = useWorkoutStore((state) => state.activeSession)
  const plan = useWorkoutStore((state) => state.plan)
  const lastResult = useWorkoutStore((state) => state.lastResult)
  const toggleSet = useWorkoutStore((state) => state.toggleSet)
  const togglePause = useWorkoutStore((state) => state.togglePause)
  const finishSession = useWorkoutStore((state) => state.finishSession)
  const abandonSession = useWorkoutStore((state) => state.abandonSession)
  const clearLastResult = useWorkoutStore((state) => state.clearLastResult)

  const [elapsed, setElapsed] = useState(0)
  const [current, setCurrent] = useState(0)
  const [rest, setRest] = useState<{ seconds: number; key: number } | null>(null)
  const [showDemo, setShowDemo] = useState(false)
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

  const index = Math.min(current, workout.exercises.length - 1)
  const item = workout.exercises[index]
  const exercise = resolveExercise(item.exerciseId)
  const name = exercise ? loc(exercise.name) : item.exerciseId
  const checks = activeSession.checked[index] ?? []
  const doneHere = checks.filter(Boolean).length

  const completedSets = activeSession.checked.flat().filter(Boolean).length
  const total = activeSession.checked.flat().length
  const allDone = completedSets === total

  const next = workout.exercises[index + 1]
  const nextExercise = next ? resolveExercise(next.exerciseId) : undefined

  /** Marca uma série: arranca o descanso e avança quando a última fecha. */
  const markSet = (setIndex: number) => {
    const wasChecked = checks[setIndex]
    toggleSet(index, setIndex)

    if (wasChecked) return
    if (item.restSeconds > 0) {
      restKey.current += 1
      setRest({ seconds: item.restSeconds, key: restKey.current })
    }
    // Era a última por fechar deste exercício — passa ao seguinte.
    if (doneHere + 1 === checks.length && index < workout.exercises.length - 1) {
      setCurrent(index + 1)
      setShowDemo(false)
    }
  }

  const finish = () => {
    if (completedSets === 0) return
    if (completedSets < total) {
      setConfirmFinish(true)
      return
    }
    finishSession()
  }

  const mainAction = () => {
    if (allDone) {
      finish()
      return
    }
    if (doneHere < checks.length) {
      markSet(doneHere)
      return
    }
    if (index < workout.exercises.length - 1) {
      setCurrent(index + 1)
      setShowDemo(false)
    }
  }

  const mainLabel = allDone
    ? t.session.finishCta
    : doneHere < checks.length
      ? t.session.setDoneCta(doneHere + 1)
      : t.session.nextExerciseCta

  return (
    // Ecrã de sessão: corre fora do `AppShell` e trata sozinho das margens
    // seguras, laterais incluídas (o projeto permite treinar em horizontal).
    <div className="flex min-h-dvh flex-col bg-void-900 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
      <header className="flex items-center justify-between gap-3 px-5 pt-[calc(1.25rem+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => setConfirmExit(true)}
          aria-label={t.session.exitAria}
          // 34 px de desenho, 44 pt de toque: treina-se com as mãos suadas e
          // estes dois botões de canto eram os mais pequenos da app.
          className="tap-target flex size-[34px] shrink-0 items-center justify-center rounded-[11px] border border-void-600 text-ink-muted active:opacity-90"
        >
          <Icon name="X" size={15} />
        </button>

        {/* Um traço por exercício: o atual alarga, os fechados ficam verdes. */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {workout.exercises.map((_, i) => {
            const rowDone = (activeSession.checked[i] ?? []).every(Boolean)
            return (
              <span
                key={i}
                className={cn(
                  'h-[7px] rounded-full transition-all',
                  i === index ? 'w-[22px]' : 'w-[7px]',
                  rowDone ? 'bg-good' : i === index ? 'bg-ember' : 'bg-void-600',
                )}
              />
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              'font-display text-[16px] font-semibold tabular-nums',
              activeSession.paused ? 'text-ink-faint' : 'text-ink-muted',
            )}
          >
            {formatDuration(elapsed)}
          </span>
          <button
            type="button"
            onClick={togglePause}
            aria-label={activeSession.paused ? t.session.resume : t.session.pause}
            className="tap-target flex size-[34px] items-center justify-center rounded-[11px] border border-void-600 text-ink-muted active:opacity-90"
          >
            <Icon name={activeSession.paused ? 'Play' : 'Pause'} size={13} />
          </button>
        </div>
      </header>

      <div className="px-5 pt-3">
        <div className="flex items-baseline justify-between text-[10px] font-semibold tracking-[0.14em] text-ink-muted">
          <span>{t.session.progressLabel}</span>
          <span className="tabular-nums">
            {t.session.setsLabel(completedSets, total)} {t.session.setsCaption}
          </span>
        </div>
        <div
          className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-void-700"
          role="progressbar"
          aria-valuenow={completedSets}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={t.session.progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-crimson to-ember transition-[width]"
            style={{ width: `${total > 0 ? (completedSets / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* O exercício atual, sozinho e centrado: é a única coisa que interessa
          enquanto se treina. */}
      <div className="flex flex-1 flex-col justify-center px-6 py-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-bold tracking-[0.24em] text-ink-muted">
            {exercise ? `${t.muscles[exercise.muscleGroup]} · ${t.equipment[exercise.equipment]}`.toUpperCase() : ''}
          </p>
          {exercise && (
            <button
              type="button"
              onClick={() => setShowDemo((open) => !open)}
              aria-expanded={showDemo}
              // Era texto solto de 11 px: ~15 px de altura tocável. O `-mr-2`
              // devolve o alinhamento à direita que o padding lhe tirou.
              className="tap-target -mr-2 shrink-0 px-2 py-1.5 text-[11px] font-semibold text-ember active:opacity-90"
            >
              {showDemo ? t.session.hideDemo : t.session.showDemo}
            </button>
          )}
        </div>

        <h1
          className={cn(
            'mt-2.5 font-display leading-[0.98] font-bold text-ink [text-shadow:4px_4px_0_rgba(184,18,54,.4)]',
            name.length > 17 ? 'text-[42px]' : 'text-[50px]',
          )}
        >
          {name}
        </h1>

        <p className="mt-4 flex items-baseline gap-2.5">
          <span className="font-display text-[34px] leading-none font-bold text-ember-soft">{item.reps}</span>
          <span className="text-sm text-ink-muted">
            {t.session.setOfTotal(Math.min(doneHere + 1, checks.length), checks.length)}
          </span>
        </p>

        {exercise && (
          <p className="mt-3.5 max-w-[32ch] text-[13px] leading-[1.6] text-pretty text-ink-muted">
            {loc(exercise.description)}
          </p>
        )}

        {showDemo && exercise && (
          <ExerciseDemo exerciseId={exercise.id} exerciseName={name} className="mt-4 max-w-[16rem]" />
        )}
      </div>

      {rest && <RestCard key={rest.key} seconds={rest.seconds} onDismiss={() => setRest(null)} />}

      {/*
        Mesma correção da barra de separadores: o `1.625rem` era o indicador de
        início estimado à mão e passou a somar-se ao inset verdadeiro — 60 px de
        vazio por baixo do último botão num 16 Pro Max. Aqui não há barra
        nenhuma, só a margem do ecrã: 12 px de respiro mais o inset, 46 px.
      */}
      <div className="px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">
            {t.session.setsCaption} · {t.session.setsLabel(completedSets, total)}
          </span>
          {item.restSeconds > 0 && (
            <span className="text-[11.5px] font-semibold text-ink-muted">{t.session.restOf(item.restSeconds)}</span>
          )}
        </div>

        <div className="flex gap-2">
          {checks.map((checked, setIndex) => (
            <button
              key={setIndex}
              type="button"
              role="checkbox"
              aria-checked={checked}
              aria-label={t.session.setAria(setIndex + 1, name)}
              onClick={() => markSet(setIndex)}
              className={cn(
                'flex h-[66px] flex-1 flex-col items-center justify-center gap-[3px] rounded-2xl border transition-colors',
                checked ? 'border-good/50 bg-good/[0.14]' : 'border-void-600 bg-void-800',
              )}
            >
              <span
                className={cn(
                  'font-display text-[22px] leading-none font-bold',
                  checked ? 'text-good' : 'text-ink-faint',
                )}
              >
                {setIndex + 1}
              </span>
              <span className={cn('text-[9.5px] font-semibold', checked ? 'text-good' : 'text-ink-faint')}>
                {checked ? t.session.setDone : ''}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={mainAction}
          // `text-void-950` em vez de `text-void-900`: no extremo carmim do
          // gradiente o preto mais claro dava 2,96:1, um fio abaixo dos 3:1 que
          // a WCAG pede a texto grande. Com este fica em 3,03:1 e a diferença
          // de cor não se vê.
          className="mt-2 h-16 w-full rounded-[18px] bg-gradient-to-br from-ember to-crimson font-display text-xl font-bold tracking-[0.05em] text-void-950 shadow-[0_14px_36px_-10px_rgba(255,122,26,.9)] transition-opacity active:opacity-90"
        >
          {mainLabel}
        </button>

        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          <span className="text-[11.5px] text-ink-muted">{t.session.upNext}</span>
          <span className="text-[11.5px] font-semibold text-ink">
            {nextExercise ? loc(nextExercise.name) : t.session.endOfSession}
          </span>
        </div>

        {/* O protótipo só deixa concluir com tudo feito, mas a app recompensa
            sessões parciais — sem esta saída, quem parasse a meio perdia o
            reiatsu que já tinha ganho. */}
        {completedSets > 0 && !allDone && (
          <button
            type="button"
            onClick={finish}
            // Termina a sessão a meio: tinha 24 px de altura tocável, mesmo por
            // baixo do botão principal de 64 px. Agora tem 44.
            className="mt-1 min-h-11 w-full text-center text-[11.5px] font-semibold text-ink-muted active:opacity-90"
          >
            {t.session.finish}
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmExit}
        title={t.session.exitTitle}
        message={t.session.exitMessage}
        confirmLabel={t.session.exitConfirm}
        cancelLabel={t.session.exitCancel}
        destructive
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => {
          abandonSession()
          navigate('/treino', { replace: true })
        }}
      />

      <ConfirmDialog
        open={confirmFinish}
        title={t.session.finishEarlyTitle}
        message={t.session.finishEarlyMessage(completedSets, total)}
        confirmLabel={t.session.finishEarlyConfirm}
        cancelLabel={t.session.finishEarlyCancel}
        onCancel={() => setConfirmFinish(false)}
        onConfirm={() => {
          setConfirmFinish(false)
          finishSession()
        }}
      />
    </div>
  )
}

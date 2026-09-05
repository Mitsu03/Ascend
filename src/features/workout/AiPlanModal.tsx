import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { Disclaimer, Field, TextArea, TextInput } from '@/components/ui/Misc'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { AiNotConfiguredError, AiRequestError, aiIsConfigured } from '@/services/aiClient'
import { askPlanQuestions, buildPlan } from '@/services/aiPlanner'
import { estimateDuration, totalSets } from '@/services/planGenerator'
import { useExerciseResolver, useExerciseStore } from '@/store/exerciseStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { useWorkoutStore } from '@/store/workoutStore'
import type { PlanDraft, PlanQuestion } from '@/services/aiPlanner'

interface AiPlanModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'prompt' | 'questions' | 'preview'
type Status = 'idle' | 'asking' | 'building' | 'error'

/** Uma pergunta da IA com os seus chips de sugestão e o campo de resposta livre. */
function QuestionCard({
  question,
  answer,
  onAnswer,
}: {
  question: PlanQuestion
  answer: string
  onAnswer: (value: string) => void
}) {
  const { t } = useI18n()
  const labelId = useId()

  return (
    <li className="chamfer-md border border-void-600 bg-void-800/40 p-3.5">
      <p id={labelId} className="text-sm font-medium text-ink">
        {question.question}
      </p>
      {question.options.length > 0 && (
        <div role="group" aria-labelledby={labelId} className="mt-2 flex flex-wrap gap-1.5">
          {question.options.map((option) => {
            const active = answer === option
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => onAnswer(active ? '' : option)}
                className={cn(
                  'chamfer-xs border px-3 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'border-ember/60 bg-ember/10 text-ember'
                    : 'border-void-600 text-ink-muted hover:text-ink',
                )}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}
      <TextInput
        className="mt-2.5"
        value={answer}
        placeholder={t.aiPlan.answerPlaceholder}
        aria-label={t.aiPlan.answerAria(question.question)}
        onChange={(event) => onAnswer(event.target.value)}
      />
    </li>
  )
}

export function AiPlanModal({ open, onClose }: AiPlanModalProps) {
  const { t, lang, loc } = useI18n()
  const profile = useUserStore((state) => state.profile)
  const config = useSettingsStore((state) => state.vision)
  const plan = useWorkoutStore((state) => state.plan)
  const applyGeneratedPlan = useWorkoutStore((state) => state.applyGeneratedPlan)
  const addExercises = useExerciseStore((state) => state.addExercises)
  const resolveExercise = useExerciseResolver()

  const [step, setStep] = useState<Step>('prompt')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [promptError, setPromptError] = useState<string | null>(null)
  const [request, setRequest] = useState('')
  const [questions, setQuestions] = useState<PlanQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<PlanDraft | null>(null)
  const [replace, setReplace] = useState(false)
  const [confirmingReplace, setConfirmingReplace] = useState(false)

  // O passo muda dentro do mesmo diálogo: sem isto o foco cai no <body>.
  const stepRef = useRef<HTMLDivElement>(null)

  const configured = aiIsConfigured(config)
  const busy = status === 'asking' || status === 'building'

  const reset = useCallback(() => {
    setStep('prompt')
    setStatus('idle')
    setError(null)
    setPromptError(null)
    setRequest('')
    setQuestions([])
    setAnswers({})
    setDraft(null)
    setReplace(false)
    setConfirmingReplace(false)
  }, [])

  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  useEffect(() => {
    if (open) stepRef.current?.focus()
  }, [open, step])

  const describeFailure = useCallback(
    (cause: unknown) => {
      if (cause instanceof AiNotConfiguredError) return t.aiPlan.notConfigured
      if (cause instanceof AiRequestError && cause.detail) {
        return `${t.aiPlan.failed} ${t.photoLog.visionErrorDetail(cause.detail)}`
      }
      return t.aiPlan.failed
    },
    [t],
  )

  const answerList = useMemo(
    () => questions.map((question) => ({ question: question.question, answer: answers[question.id] ?? '' })),
    [questions, answers],
  )

  const generate = useCallback(async () => {
    if (!profile) return
    setStatus('building')
    setError(null)
    try {
      const result = await buildPlan(request, answerList, profile, lang, config)
      if (result.days.length === 0) {
        setStatus('error')
        setError(t.aiPlan.emptyPlan)
        return
      }
      setDraft(result)
      setStep('preview')
      setStatus('idle')
    } catch (cause) {
      setStatus('error')
      setError(describeFailure(cause))
    }
  }, [answerList, config, describeFailure, lang, profile, request, t])

  const ask = async () => {
    if (!profile) return
    if (!request.trim()) {
      setPromptError(t.aiPlan.emptyPrompt)
      return
    }
    setPromptError(null)
    setStatus('asking')
    setError(null)
    try {
      const found = await askPlanQuestions(request, profile, lang, config)
      if (found.length === 0) {
        // Nada em falta — passa direto à geração.
        await generate()
        return
      }
      setQuestions(found)
      setAnswers({})
      setStep('questions')
      setStatus('idle')
    } catch (cause) {
      setStatus('error')
      setError(describeFailure(cause))
    }
  }

  /** Guarda de facto. Só chamado depois da confirmação, quando substitui. */
  const commit = () => {
    if (!draft) return
    addExercises(draft.newExercises)
    applyGeneratedPlan(draft.days, { replace })
    onClose()
  }

  const save = () => {
    if (!draft) return
    // Substituir apaga o plano inteiro — a app já confirma ao apagar um só treino.
    if (replace && plan.length > 0) {
      setConfirmingReplace(true)
      return
    }
    commit()
  }

  const goBack = () => {
    setError(null)
    setStep(step === 'preview' && questions.length > 0 ? 'questions' : 'prompt')
  }

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-ink-muted">
        {step === 'preview' && draft
          ? t.aiPlan.daysCount(draft.days.length)
          : step === 'questions'
            ? t.aiPlan.questionsHint
            : t.aiPlan.footerHint}
      </span>
      <div className="flex gap-2">
        <Button onClick={onClose}>{t.common.cancel}</Button>
        {step !== 'prompt' && (
          <Button icon="ChevronLeft" onClick={goBack} disabled={busy}>
            {t.common.back}
          </Button>
        )}
        {step === 'prompt' && (
          <Button variant="primary" icon="Sparkles" onClick={() => void ask()} disabled={busy || !configured}>
            {t.aiPlan.ask}
          </Button>
        )}
        {step === 'questions' && (
          <Button variant="primary" icon="Sparkles" onClick={() => void generate()} disabled={busy || !configured}>
            {t.aiPlan.generate}
          </Button>
        )}
        {step === 'preview' && (
          <Button
            variant="primary"
            icon="Check"
            onClick={save}
            disabled={busy || !draft || draft.days.length === 0}
          >
            {t.aiPlan.save}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Modal
      open={open}
      // Ambos os diálogos ouvem o Escape; sem esta guarda, cancelar a confirmação
      // fechava também o plano por trás e o rascunho perdia-se.
      onClose={() => {
        if (!confirmingReplace) onClose()
      }}
      title={t.aiPlan.title}
      description={t.aiPlan.description}
      size="lg"
      footer={footer}
    >
      <div ref={stepRef} tabIndex={-1} className="space-y-4 focus:outline-none">
        {!configured && (
          <p className="chamfer-md border border-void-600 bg-void-900/50 p-3 text-xs leading-relaxed text-ink-muted">
            {t.aiPlan.notConfigured}
          </p>
        )}

        {busy && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-3 chamfer-md border border-ember/35 bg-ember/5 p-4"
          >
            <Icon name="Sparkles" size={18} className="animate-pulse-glow text-ember" />
            <p className="text-sm text-ink">
              {status === 'asking' ? t.aiPlan.askingQuestions : t.aiPlan.thinking}
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 chamfer-md border border-warn/40 bg-warn/5 p-3 text-sm text-ink"
          >
            <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0 text-warn" />
            {error}
          </p>
        )}

        {step === 'prompt' && (
          <div className="space-y-3">
            <Field label={t.aiPlan.promptLabel} error={promptError ?? undefined}>
              {(id) => (
                <TextArea
                  id={id}
                  value={request}
                  rows={4}
                  maxLength={600}
                  disabled={busy}
                  placeholder={t.aiPlan.promptPlaceholder}
                  onChange={(event) => {
                    setRequest(event.target.value)
                    if (promptError) setPromptError(null)
                  }}
                />
              )}
            </Field>
            {/* Os exemplos substituem o que está escrito, por isso saem de cena assim que há texto. */}
            {!request.trim() && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-ink-muted">{t.aiPlan.examplesTitle}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.aiPlan.examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      disabled={busy}
                      onClick={() => setRequest(example)}
                      className="inline-flex items-center gap-1.5 chamfer-md border border-void-600 bg-void-800/50 px-3 py-2 text-left text-xs text-ink-muted transition-colors hover:border-void-500 hover:text-ink disabled:opacity-45"
                    >
                      <Icon name="Plus" size={12} className="shrink-0" />
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'questions' && (
          <ul className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                answer={answers[question.id] ?? ''}
                onAnswer={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
              />
            ))}
          </ul>
        )}

        {step === 'preview' && draft && (
          <div className={cn('space-y-4', busy && 'pointer-events-none opacity-50')}>
            {draft.summary && (
              <p className="chamfer-md border border-ember/35 bg-ember/5 p-3.5 text-sm leading-relaxed text-ink">
                {draft.summary}
              </p>
            )}

            <Button icon="RefreshCw" onClick={() => void generate()} disabled={busy}>
              {t.aiPlan.regenerate}
            </Button>

            <ul className="space-y-3">
              {draft.days.map((day) => (
                <li key={day.id} className="chamfer-md border border-void-600 bg-void-800/40 p-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-ink">{loc(day.name)}</p>
                    <span className="text-xs text-ink-muted">{t.weekdays.long[day.dayOfWeek]}</span>
                  </div>
                  {loc(day.focus) && <p className="mt-0.5 text-xs text-ink-muted">{loc(day.focus)}</p>}
                  <p className="mt-1 text-xs text-ink-muted">
                    {t.workout.exercises(day.exercises.length)} · {t.workout.sets(totalSets(day.exercises))} ·{' '}
                    {t.workout.approxMinutes(estimateDuration(day.exercises))}
                  </p>
                  <ul className="mt-2.5 space-y-1">
                    {day.exercises.map((item) => {
                      const fresh = draft.newExercises.find((entry) => entry.id === item.exerciseId)
                      const exercise = fresh ?? resolveExercise(item.exerciseId)
                      return (
                        <li
                          key={item.exerciseId}
                          className="flex items-center justify-between gap-3 text-sm text-ink-muted"
                        >
                          <span className="min-w-0 truncate">
                            {exercise ? loc(exercise.name) : item.exerciseId}
                            {fresh && <span className="ml-1.5 text-xs text-ember">{t.aiPlan.newTag}</span>}
                          </span>
                          <span className="shrink-0 tabular-nums text-ink">
                            {item.sets} × {item.reps}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            {draft.newExercises.length > 0 && (
              <p className="text-xs text-ink-muted">{t.aiPlan.newExercises(draft.newExercises.length)}</p>
            )}

            <label className="flex cursor-pointer items-start gap-2.5 chamfer-md border border-void-600 bg-void-900/50 p-3">
              <input
                type="checkbox"
                checked={replace}
                onChange={(event) => setReplace(event.target.checked)}
                className="mt-0.5 size-4 accent-ember"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">{t.aiPlan.replaceLabel}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                  {replace ? t.aiPlan.replaceOn(plan.length) : t.aiPlan.replaceOff}
                </span>
              </span>
            </label>
          </div>
        )}

        <Disclaimer>{t.aiPlan.disclaimer}</Disclaimer>
      </div>

      <ConfirmDialog
        open={confirmingReplace}
        title={t.aiPlan.confirmReplaceTitle}
        message={t.aiPlan.confirmReplaceMessage(plan.length)}
        confirmLabel={t.aiPlan.save}
        destructive
        onCancel={() => setConfirmingReplace(false)}
        onConfirm={() => {
          setConfirmingReplace(false)
          commit()
        }}
      />
    </Modal>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DivisionSeal } from '@/components/DivisionSeal'
import { HollowMask } from '@/components/art/HollowMask'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Disclaimer, Field, OptionCard, Select, TextInput } from '@/components/ui/Misc'
import { ProgressBar } from '@/components/ui/Progress'
import { DIVISIONS, suggestedDivision } from '@/data/divisions'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { computeTargets } from '@/services/calculations'
import { completeOnboarding } from '@/services/session'
import type { DietPreference, Equipment, ExperienceLevel, Goal, Sex, UserProfile } from '@/types'

const GOAL_ORDER: Goal[] = ['perder_gordura', 'ganhar_massa', 'manter', 'condicao_fisica']
const GOAL_ICONS: Record<Goal, string> = {
  perder_gordura: 'Flame',
  ganhar_massa: 'Dumbbell',
  manter: 'Shield',
  condicao_fisica: 'Activity',
}

const LEVEL_ORDER: ExperienceLevel[] = ['iniciante', 'intermedio', 'avancado']
const LEVEL_ICONS: Record<ExperienceLevel, string> = {
  iniciante: 'Star',
  intermedio: 'TrendingUp',
  avancado: 'Trophy',
}

const EQUIPMENT_ORDER: Equipment[] = ['nenhum', 'halteres', 'ginasio']
const EQUIPMENT_ICONS: Record<Equipment, string> = {
  nenhum: 'Home',
  halteres: 'Dumbbell',
  ginasio: 'Hammer',
}

const DIET_ORDER: DietPreference[] = ['sem_preferencia', 'mediterranica', 'vegetariano', 'vegan']

const TOTAL_STEPS = 6

interface Draft {
  name: string
  goal: Goal
  level: ExperienceLevel
  daysPerWeek: number
  equipment: Equipment
  weightKg: string
  heightCm: string
  age: string
  sex: Sex
  dietPreference: DietPreference
  divisionId: number
}

const INITIAL_DRAFT: Draft = {
  name: '',
  goal: 'ganhar_massa',
  level: 'iniciante',
  daysPerWeek: 3,
  equipment: 'nenhum',
  weightKg: '',
  heightCm: '',
  age: '',
  sex: 'masculino',
  dietPreference: 'sem_preferencia',
  divisionId: suggestedDivision('ganhar_massa'),
}

function toProfile(draft: Draft): UserProfile {
  return {
    name: draft.name.trim(),
    goal: draft.goal,
    level: draft.level,
    daysPerWeek: draft.daysPerWeek,
    equipment: draft.equipment,
    weightKg: Number(draft.weightKg),
    heightCm: Number(draft.heightCm),
    age: Number(draft.age),
    sex: draft.sex,
    dietPreference: draft.dietPreference,
    createdAt: new Date().toISOString(),
    avatarVariant: 0,
    avatarHue: 24,
    divisionId: draft.divisionId,
    showMask: true,
  }
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { t, n, loc } = useI18n()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT)
  const [touched, setTouched] = useState(false)

  const patch = (values: Partial<Draft>) => setDraft((current) => ({ ...current, ...values }))

  const errors = useMemo(() => {
    const result: Partial<Record<keyof Draft, string>> = {}
    if (!draft.name.trim()) result.name = t.onboarding.nameError
    const weight = Number(draft.weightKg)
    const height = Number(draft.heightCm)
    const age = Number(draft.age)
    if (!Number.isFinite(weight) || weight < 30 || weight > 300) result.weightKg = t.onboarding.weightError
    if (!Number.isFinite(height) || height < 120 || height > 230) result.heightCm = t.onboarding.heightError
    if (!Number.isFinite(age) || age < 14 || age > 100) result.age = t.onboarding.ageError
    return result
  }, [draft, t])

  const stepValid = (index: number): boolean => {
    if (index === 0) return !errors.name
    if (index === 4) return !errors.weightKg && !errors.heightCm && !errors.age
    return true
  }

  const targets = useMemo(() => {
    if (errors.weightKg || errors.heightCm || errors.age) return null
    return computeTargets(toProfile(draft))
  }, [draft, errors])

  const goNext = () => {
    setTouched(true)
    if (!stepValid(step)) return
    setTouched(false)
    setStep((current) => Math.min(TOTAL_STEPS - 1, current + 1))
  }

  const goBack = () => setStep((current) => Math.max(0, current - 1))

  const finish = () => {
    completeOnboarding(toProfile(draft))
    navigate('/', { replace: true })
  }

  return (
    // Fora do `AppShell`: as margens seguras são tratadas aqui. Sem elas o
    // contador de passos ficava debaixo da Dynamic Island e a linha de botões
    // «Voltar / Continuar» sobre o indicador de início.
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 pt-[calc(2rem+env(safe-area-inset-top))] pr-[calc(1.25rem+env(safe-area-inset-right))] pb-[calc(2rem+env(safe-area-inset-bottom))] pl-[calc(1.25rem+env(safe-area-inset-left))]">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-xl font-bold tracking-[0.2em] text-ink">
            <HollowMask size={22} />
            {t.app.name}
            <span className="text-[10px] tracking-[0.4em] text-ember/85">{t.app.kanji}</span>
          </span>
          <span className="text-sm tabular-nums text-ink-muted">{t.onboarding.stepOf(step + 1, TOTAL_STEPS)}</span>
        </div>
        <ProgressBar value={step + 1} max={TOTAL_STEPS} tone="xp" height="sm" label={t.onboarding.progressLabel} />
      </header>

      <Card className="flex-1 p-6" key={step}>
        <div className="animate-rise space-y-6">
          {step === 0 && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">{t.onboarding.welcomeTitle}</h1>
                <p className="mt-1.5 leading-relaxed text-ink-muted">{t.onboarding.welcomeText}</p>
              </div>
              <Field label={t.onboarding.nameLabel} error={touched ? errors.name : undefined}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.name}
                    autoFocus
                    maxLength={24}
                    /*
                     * Teclado certo à primeira: nome próprio com maiúscula
                     * automática, sem correção ortográfica a trocar nomes por
                     * palavras do dicionário, e a tecla Enter a dizer
                     * «Continuar», que é o que ela faz aqui.
                     */
                    autoComplete="given-name"
                    autoCapitalize="words"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder={t.onboarding.namePlaceholder}
                    onChange={(event) => patch({ name: event.target.value })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') goNext()
                    }}
                  />
                )}
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">{t.onboarding.goalTitle}</h1>
                <p className="mt-1.5 text-ink-muted">{t.onboarding.goalText}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {GOAL_ORDER.map((goal) => (
                  <OptionCard
                    key={goal}
                    selected={draft.goal === goal}
                    /* A divisão sugerida acompanha o objetivo — o passo dela vem depois. */
                    onSelect={() => patch({ goal, divisionId: suggestedDivision(goal) })}
                    icon={GOAL_ICONS[goal]}
                    title={t.goals[goal]}
                    description={t.goalDescriptions[goal]}
                  />
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">{t.onboarding.trainingTitle}</h1>
                <p className="mt-1.5 text-ink-muted">{t.onboarding.trainingText}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-muted">{t.onboarding.experienceLabel}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {LEVEL_ORDER.map((level) => (
                    <OptionCard
                      key={level}
                      selected={draft.level === level}
                      onSelect={() => patch({ level })}
                      icon={LEVEL_ICONS[level]}
                      title={t.levels[level]}
                      description={t.levelDescriptions[level]}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-muted">{t.onboarding.daysLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {[2, 3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      aria-pressed={draft.daysPerWeek === days}
                      onClick={() => patch({ daysPerWeek: days })}
                      className={
                        draft.daysPerWeek === days
                          ? 'size-12 rounded-xl border border-ember/70 bg-ember/10 font-display text-lg font-bold text-ember'
                          : 'size-12 rounded-xl border border-void-600 bg-void-800/60 font-display text-lg font-bold text-ink-muted transition-colors hover:border-void-500 hover:text-ink'
                      }
                    >
                      {days}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-muted">{t.onboarding.equipmentLabel}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {EQUIPMENT_ORDER.map((equipment) => (
                    <OptionCard
                      key={equipment}
                      selected={draft.equipment === equipment}
                      onSelect={() => patch({ equipment })}
                      icon={EQUIPMENT_ICONS[equipment]}
                      title={t.equipment[equipment]}
                      description={t.equipmentDescriptions[equipment]}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">{t.onboarding.divisionTitle}</h1>
                <p className="mt-1.5 text-ink-muted">{t.onboarding.divisionText}</p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {DIVISIONS.map((division) => {
                  const selected = draft.divisionId === division.id
                  return (
                    <button
                      key={division.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => patch({ divisionId: division.id })}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                        selected
                          ? 'border-ember bg-ember/10'
                          : 'border-void-600 hover:border-void-500 hover:bg-void-700/40',
                      )}
                    >
                      <DivisionSeal divisionId={division.id} size={46} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{loc(division.name)}</span>
                        <span className="block truncate text-xs text-ink-muted">{loc(division.role)}</span>
                        {division.id === suggestedDivision(draft.goal) && (
                          <span className="mt-0.5 block text-[11px] text-ember-soft">
                            {t.onboarding.divisionSuggested}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">{t.onboarding.bodyTitle}</h1>
                <p className="mt-1.5 text-ink-muted">{t.onboarding.bodyText}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.onboarding.weightLabel} error={touched ? errors.weightKg : undefined}>
                  {(id) => (
                    <TextInput
                      id={id}
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      placeholder="74"
                      value={draft.weightKg}
                      onChange={(event) => patch({ weightKg: event.target.value })}
                    />
                  )}
                </Field>
                <Field label={t.onboarding.heightLabel} error={touched ? errors.heightCm : undefined}>
                  {(id) => (
                    <TextInput
                      id={id}
                      type="number"
                      inputMode="numeric"
                      placeholder="178"
                      value={draft.heightCm}
                      onChange={(event) => patch({ heightCm: event.target.value })}
                    />
                  )}
                </Field>
                <Field label={t.onboarding.ageLabel} error={touched ? errors.age : undefined}>
                  {(id) => (
                    <TextInput
                      id={id}
                      type="number"
                      inputMode="numeric"
                      placeholder="24"
                      value={draft.age}
                      onChange={(event) => patch({ age: event.target.value })}
                    />
                  )}
                </Field>
                <Field label={t.onboarding.sexLabel} hint={t.onboarding.sexHint}>
                  {(id) => (
                    <Select id={id} value={draft.sex} onChange={(event) => patch({ sex: event.target.value as Sex })}>
                      <option value="masculino">{t.sexes.masculino}</option>
                      <option value="feminino">{t.sexes.feminino}</option>
                    </Select>
                  )}
                </Field>
                <Field label={t.onboarding.dietLabel}>
                  {(id) => (
                    <Select
                      id={id}
                      value={draft.dietPreference}
                      onChange={(event) => patch({ dietPreference: event.target.value as DietPreference })}
                    >
                      {DIET_ORDER.map((diet) => (
                        <option key={diet} value={diet}>
                          {t.diets[diet]}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>
            </>
          )}

          {step === 5 && targets && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">{t.onboarding.summaryTitle(draft.name.trim())}</h1>
                <p className="mt-1.5 leading-relaxed text-ink-muted">{t.onboarding.summaryText}</p>
              </div>

              <div className="rounded-2xl border border-ember/30 bg-ember/5 p-5 text-center">
                <p className="text-sm font-medium text-ink-muted">{t.onboarding.calorieGoal}</p>
                <p className="font-display text-5xl font-bold text-ember">
                  {n(targets.calories)}
                  <span className="ml-1 text-xl text-ink-muted">{t.units.kcal}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t.macros.protein, value: targets.proteinG, color: 'text-ember' },
                  { label: t.macros.carbs, value: targets.carbsG, color: 'text-crimson-soft' },
                  { label: t.macros.fat, value: targets.fatG, color: 'text-gold' },
                ].map((macro) => (
                  <div key={macro.label} className="rounded-xl border border-void-600 bg-void-900/40 p-4 text-center">
                    <p className="text-xs font-medium text-ink-muted">{macro.label}</p>
                    <p className={`font-display text-2xl font-bold ${macro.color}`}>
                      {macro.value} {t.units.grams}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-void-600 bg-void-900/40 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon name="Sparkles" size={16} className="text-gold" />
                  {t.onboarding.whatsNext}
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
                  <li>· {t.onboarding.nextPlan(draft.daysPerWeek)}</li>
                  <li>· {t.onboarding.nextQuests}</li>
                  <li>· {t.onboarding.nextLevel}</li>
                </ul>
              </div>

              <Disclaimer>{t.disclaimer.onboarding}</Disclaimer>
            </>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button icon="ArrowLeft" onClick={goBack} disabled={step === 0}>
          {t.common.back}
        </Button>
        {step < TOTAL_STEPS - 1 ? (
          <Button variant="primary" iconRight="ArrowRight" onClick={goNext}>
            {t.common.next}
          </Button>
        ) : (
          <Button variant="primary" size="lg" icon="Zap" onClick={finish}>
            {t.onboarding.finish}
          </Button>
        )}
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Disclaimer, Field, OptionCard, Select, TextInput } from '@/components/ui/Misc'
import { ProgressBar } from '@/components/ui/Progress'
import { computeTargets } from '@/services/calculations'
import { completeOnboarding } from '@/services/session'
import { formatNumber } from '@/lib/cn'
import type { DietPreference, Equipment, ExperienceLevel, Goal, Sex, UserProfile } from '@/types'

const GOALS: { value: Goal; title: string; description: string; icon: string }[] = [
  { value: 'perder_gordura', title: 'Perder gordura', description: 'Défice calórico moderado com proteína alta.', icon: 'Flame' },
  { value: 'ganhar_massa', title: 'Ganhar massa', description: 'Excedente controlado e treino de força.', icon: 'Dumbbell' },
  { value: 'manter', title: 'Manter', description: 'Manter o peso e melhorar composição corporal.', icon: 'Shield' },
  { value: 'condicao_fisica', title: 'Melhorar condição física', description: 'Foco em resistência, energia e hábito.', icon: 'Activity' },
]

const LEVELS: { value: ExperienceLevel; title: string; description: string; icon: string }[] = [
  { value: 'iniciante', title: 'Iniciante', description: 'Menos de 6 meses de treino regular.', icon: 'Star' },
  { value: 'intermedio', title: 'Intermédio', description: 'Treinas com consistência há mais de 6 meses.', icon: 'TrendingUp' },
  { value: 'avancado', title: 'Avançado', description: 'Anos de treino e domínio técnico.', icon: 'Trophy' },
]

const EQUIPMENTS: { value: Equipment; title: string; description: string; icon: string }[] = [
  { value: 'nenhum', title: 'Sem equipamento', description: 'Treinos com o peso do corpo, em casa.', icon: 'Home' },
  { value: 'halteres', title: 'Halteres', description: 'Um par de halteres ou kettlebells.', icon: 'Dumbbell' },
  { value: 'ginasio', title: 'Ginásio', description: 'Acesso a máquinas, barras e cardio.', icon: 'Hammer' },
]

const DIETS: { value: DietPreference; label: string }[] = [
  { value: 'sem_preferencia', label: 'Sem preferência' },
  { value: 'mediterranica', label: 'Mediterrânica' },
  { value: 'vegetariano', label: 'Vegetariana' },
  { value: 'vegan', label: 'Vegana' },
]

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
}

const STEP_TITLES = ['Identidade', 'Objetivo', 'Treino', 'Corpo', 'Resumo']

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
    avatarHue: 195,
  }
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT)
  const [touched, setTouched] = useState(false)

  const patch = (values: Partial<Draft>) => setDraft((current) => ({ ...current, ...values }))

  const errors = useMemo(() => {
    const result: Partial<Record<keyof Draft, string>> = {}
    if (!draft.name.trim()) result.name = 'Escreve o teu nome para personalizarmos a jornada.'
    const weight = Number(draft.weightKg)
    const height = Number(draft.heightCm)
    const age = Number(draft.age)
    if (!Number.isFinite(weight) || weight < 30 || weight > 300) result.weightKg = 'Peso entre 30 e 300 kg.'
    if (!Number.isFinite(height) || height < 120 || height > 230) result.heightCm = 'Altura entre 120 e 230 cm.'
    if (!Number.isFinite(age) || age < 14 || age > 100) result.age = 'Idade entre 14 e 100 anos.'
    return result
  }, [draft])

  const stepValid = (index: number): boolean => {
    if (index === 0) return !errors.name
    if (index === 3) return !errors.weightKg && !errors.heightCm && !errors.age
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
    setStep((current) => Math.min(STEP_TITLES.length - 1, current + 1))
  }

  const goBack = () => setStep((current) => Math.max(0, current - 1))

  const finish = () => {
    completeOnboarding(toProfile(draft))
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-5 py-8">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-xl font-bold tracking-widest text-ink">
            <Icon name="Zap" size={20} className="text-cyan-electric" />
            ASCEND
          </span>
          <span className="text-sm tabular-nums text-ink-muted">
            Passo {step + 1} de {STEP_TITLES.length}
          </span>
        </div>
        <ProgressBar value={step + 1} max={STEP_TITLES.length} tone="xp" height="sm" label="Progresso do onboarding" />
      </header>

      <Card className="flex-1 p-6" key={step}>
        <div className="animate-rise space-y-6">
          {step === 0 && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">Bem-vindo, herói.</h1>
                <p className="mt-1.5 leading-relaxed text-ink-muted">
                  Antes de começarmos, como te chamas? É o nome que vais ver na tua base todos os dias.
                </p>
              </div>
              <Field label="O teu nome" error={touched ? errors.name : undefined}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={draft.name}
                    autoFocus
                    maxLength={24}
                    placeholder="Ex.: Kai"
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
                <h1 className="text-2xl font-bold text-ink">Qual é o teu objetivo?</h1>
                <p className="mt-1.5 text-ink-muted">Define as tuas metas de calorias e o tipo de plano.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {GOALS.map((goal) => (
                  <OptionCard
                    key={goal.value}
                    selected={draft.goal === goal.value}
                    onSelect={() => patch({ goal: goal.value })}
                    icon={goal.icon}
                    title={goal.title}
                    description={goal.description}
                  />
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">Como treinas?</h1>
                <p className="mt-1.5 text-ink-muted">Vamos montar um plano semanal à tua medida.</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-muted">Nível de experiência</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {LEVELS.map((level) => (
                    <OptionCard
                      key={level.value}
                      selected={draft.level === level.value}
                      onSelect={() => patch({ level: level.value })}
                      icon={level.icon}
                      title={level.title}
                      description={level.description}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-muted">Dias disponíveis por semana</p>
                <div className="flex flex-wrap gap-2">
                  {[2, 3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      aria-pressed={draft.daysPerWeek === days}
                      onClick={() => patch({ daysPerWeek: days })}
                      className={
                        draft.daysPerWeek === days
                          ? 'size-12 rounded-xl border border-cyan-electric/70 bg-cyan-electric/10 font-display text-lg font-bold text-cyan-electric'
                          : 'size-12 rounded-xl border border-night-600 bg-night-800/60 font-display text-lg font-bold text-ink-muted transition-colors hover:border-night-500 hover:text-ink'
                      }
                    >
                      {days}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-muted">Equipamento disponível</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {EQUIPMENTS.map((equipment) => (
                    <OptionCard
                      key={equipment.value}
                      selected={draft.equipment === equipment.value}
                      onSelect={() => patch({ equipment: equipment.value })}
                      icon={equipment.icon}
                      title={equipment.title}
                      description={equipment.description}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">Os teus dados</h1>
                <p className="mt-1.5 text-ink-muted">
                  Servem apenas para estimar calorias e macros. Ficam guardados neste dispositivo.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Peso (kg)" error={touched ? errors.weightKg : undefined}>
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
                <Field label="Altura (cm)" error={touched ? errors.heightCm : undefined}>
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
                <Field label="Idade" error={touched ? errors.age : undefined}>
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
                <Field label="Sexo biológico" hint="Usado apenas na fórmula de metabolismo basal.">
                  {(id) => (
                    <Select
                      id={id}
                      value={draft.sex}
                      onChange={(event) => patch({ sex: event.target.value as Sex })}
                    >
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </Select>
                  )}
                </Field>
                <Field label="Preferência alimentar (opcional)">
                  {(id) => (
                    <Select
                      id={id}
                      value={draft.dietPreference}
                      onChange={(event) => patch({ dietPreference: event.target.value as DietPreference })}
                    >
                      {DIETS.map((diet) => (
                        <option key={diet.value} value={diet.value}>
                          {diet.label}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>
            </>
          )}

          {step === 4 && targets && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-ink">Tudo pronto, {draft.name.trim()}.</h1>
                <p className="mt-1.5 leading-relaxed text-ink-muted">
                  Com base nos teus dados, esta é a nossa estimativa diária. Podes ajustá-la mais tarde no perfil.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-electric/30 bg-cyan-electric/5 p-5 text-center">
                <p className="text-sm font-medium text-ink-muted">Meta calórica diária</p>
                <p className="font-display text-5xl font-bold text-cyan-electric">
                  {formatNumber(targets.calories)}
                  <span className="ml-1 text-xl text-ink-muted">kcal</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Proteína', value: targets.proteinG, color: 'text-cyan-electric' },
                  { label: 'Hidratos', value: targets.carbsG, color: 'text-violet-soft' },
                  { label: 'Gordura', value: targets.fatG, color: 'text-gold' },
                ].map((macro) => (
                  <div key={macro.label} className="rounded-xl border border-night-600 bg-night-900/40 p-4 text-center">
                    <p className="text-xs font-medium text-ink-muted">{macro.label}</p>
                    <p className={`font-display text-2xl font-bold ${macro.color}`}>{macro.value} g</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-night-600 bg-night-900/40 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon name="Sparkles" size={16} className="text-gold" />
                  O que acontece a seguir
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
                  <li>· Plano semanal de {draft.daysPerWeek} treinos gerado automaticamente</li>
                  <li>· 3 missões diárias e desafios semanais prontos a começar</li>
                  <li>· Nível 1 — cada treino, refeição e missão dá XP</li>
                </ul>
              </div>

              <Disclaimer>
                Estas são estimativas para gestão pessoal e não constituem aconselhamento médico ou nutricional.
                Se tens alguma condição de saúde, consulta um profissional antes de mudar treino ou alimentação.
              </Disclaimer>
            </>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button icon="ArrowLeft" onClick={goBack} disabled={step === 0}>
          Voltar
        </Button>
        {step < STEP_TITLES.length - 1 ? (
          <Button variant="primary" iconRight="ArrowRight" onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <Button variant="primary" size="lg" icon="Zap" onClick={finish}>
            Iniciar Jornada
          </Button>
        )}
      </div>
    </div>
  )
}

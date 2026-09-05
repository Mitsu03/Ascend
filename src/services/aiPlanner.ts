import { normalize } from '@/data/foods'
import { localized } from '@/i18n/types'
import { availableExercises } from '@/services/planGenerator'
import { chatJson } from '@/services/aiClient'
import type { AiConfig } from '@/services/aiClient'
import type { Language } from '@/i18n/types'
import type {
  Equipment,
  Exercise,
  ExperienceLevel,
  MuscleGroup,
  UserProfile,
  WorkoutDay,
  WorkoutExercise,
} from '@/types'

/**
 * Geração de planos de treino a partir de um pedido escrito pelo utilizador
 * ("plano semanal, 3× por semana, para correr 5 km daqui a um mês").
 *
 * São dois pedidos ao serviço: primeiro o modelo diz o que lhe falta saber e
 * devolve perguntas; depois, com as respostas, devolve o plano. O plano nunca
 * entra no dojo sem o utilizador o ver primeiro.
 *
 * O modelo escolhe de preferência exercícios do catálogo local (pelo id), mas
 * pode criar os que faltarem — o catálogo não tem corrida no exterior nem
 * séries de intervalos, que são precisamente o que um plano de 5 km pede.
 */

export interface PlanQuestion {
  id: string
  question: string
  /** Sugestões clicáveis. O utilizador pode sempre escrever a sua própria resposta. */
  options: string[]
}

export interface PlanAnswer {
  question: string
  answer: string
}

export interface PlanDraft {
  /** Explicação curta da lógica do plano, na língua ativa. */
  summary: string
  days: WorkoutDay[]
  /** Exercícios inventados pelo modelo, a registar antes de guardar o plano. */
  newExercises: Exercise[]
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'peito',
  'costas',
  'pernas',
  'ombros',
  'bracos',
  'antebracos',
  'pescoco',
  'core',
  'cardio',
  'corpo_inteiro',
]
const EQUIPMENTS: Equipment[] = ['nenhum', 'halteres', 'ginasio']
const LEVELS: ExperienceLevel[] = ['iniciante', 'intermedio', 'avancado']

const LANGUAGE_NAME: Record<Language, string> = {
  pt: 'European Portuguese (pt-PT)',
  en: 'English',
}

function profileSummary(profile: UserProfile): string {
  return [
    `goal: ${profile.goal}`,
    `experience: ${profile.level}`,
    `usual training days per week: ${profile.daysPerWeek}`,
    `equipment available: ${profile.equipment}`,
    `age: ${profile.age}`,
    `sex: ${profile.sex}`,
    `weight: ${profile.weightKg} kg`,
    `height: ${profile.heightCm} cm`,
  ].join(', ')
}

function catalogueList(profile: UserProfile): string {
  // O filtro de nível não se aplica: a escolha final é revista pelo utilizador.
  return availableExercises({ equipment: profile.equipment, level: 'avancado' })
    .map((exercise) => `${exercise.id} | ${exercise.name.en} | ${exercise.muscleGroup} | ${exercise.equipment}`)
    .join('\n')
}

// ------------------------------------------------------------------ Perguntas

interface RawQuestion {
  id?: string
  question?: string
  options?: unknown
}

const QUESTIONS_PROMPT = [
  'You are a strength and conditioning coach preparing a training plan.',
  'Read the athlete profile and the request, then decide what you still need to know.',
  'Ask only questions whose answer would actually change the plan; never ask for anything already',
  'in the profile. Ask at most 4 questions, and return an empty array when the request is clear enough.',
  'Reply with JSON only, no prose, in this exact shape:',
  '{"questions":[{"id":"short_slug","question":"...","options":["...","..."]}]}',
  'options: 2 to 4 short suggested answers. The athlete may also write a free answer.',
].join(' ')

export async function askPlanQuestions(
  request: string,
  profile: UserProfile,
  language: Language,
  config: AiConfig | null,
  signal?: AbortSignal,
): Promise<PlanQuestion[]> {
  const parsed = await chatJson<{ questions?: RawQuestion[] }>(
    [
      {
        role: 'system',
        content: `${QUESTIONS_PROMPT} Write every question and option in ${LANGUAGE_NAME[language]}.`,
      },
      {
        role: 'user',
        content: `Athlete profile: ${profileSummary(profile)}\n\nRequest: ${request.trim()}`,
      },
    ],
    config,
    { maxTokens: 600, signal, temperature: 0.3 },
  )

  const raw = Array.isArray(parsed.questions) ? parsed.questions : []
  const questions: PlanQuestion[] = []
  raw.forEach((item, index) => {
    const question = typeof item.question === 'string' ? item.question.trim() : ''
    if (!question) return
    const options = Array.isArray(item.options)
      ? item.options
          .filter((option): option is string => typeof option === 'string' && option.trim().length > 0)
          .map((option) => option.trim())
          .slice(0, 4)
      : []
    questions.push({
      id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `q${index + 1}`,
      question,
      options,
    })
  })
  return questions.slice(0, 4)
}

// ---------------------------------------------------------------------- Plano

interface RawPlanExercise {
  id?: string
  sets?: number
  reps?: string
  rest?: number
  restSeconds?: number
}

interface RawPlanDay {
  name?: string
  focus?: string
  dayOfWeek?: number
  exercises?: RawPlanExercise[]
}

interface RawNewExercise {
  id?: string
  name?: string
  muscleGroup?: string
  equipment?: string
  difficulty?: string
  description?: string
}

interface RawPlan {
  summary?: string
  days?: RawPlanDay[]
  newExercises?: RawNewExercise[]
}

const PLAN_PROMPT = [
  'You are a strength and conditioning coach. Build a weekly training plan for the athlete.',
  'Prefer exercises from the catalogue below and refer to them by their exact id.',
  'When the plan genuinely needs something the catalogue lacks (outdoor running, interval sets,',
  'specific mobility work), invent it and declare it in "newExercises" — every id used in a day',
  'must exist either in the catalogue or in "newExercises".',
  'Respect the number of sessions per week the athlete asked for, and spread them across the week',
  'with rest between hard days. dayOfWeek: 0 = Sunday … 6 = Saturday.',
  'Reply with JSON only, no prose, in this exact shape:',
  '{"summary":"...","days":[{"name":"...","focus":"...","dayOfWeek":1,',
  '"exercises":[{"id":"catalogue-or-new-id","sets":3,"reps":"10-12","rest":60}]}],',
  '"newExercises":[{"id":"kebab-case-id","name":"...","muscleGroup":"cardio","equipment":"nenhum",',
  '"difficulty":"iniciante","description":"..."}]}',
  `muscleGroup: one of ${MUSCLE_GROUPS.join(', ')}.`,
  `equipment: one of ${EQUIPMENTS.join(', ')}.`,
  `difficulty: one of ${LEVELS.join(', ')}.`,
  'reps: a short string — "8-12", "30-45 s", "20 min" for continuous cardio.',
  'rest: rest between sets in seconds, 0 for continuous work.',
  'summary: two or three sentences explaining how the plan gets the athlete to their goal.',
].join(' ')

function slug(value: string): string {
  const base = normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || 'exercicio'
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as T) : fallback
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

export async function buildPlan(
  request: string,
  answers: PlanAnswer[],
  profile: UserProfile,
  language: Language,
  config: AiConfig | null,
  signal?: AbortSignal,
): Promise<PlanDraft> {
  const answered = answers
    .filter((item) => item.answer.trim().length > 0)
    .map((item) => `- ${item.question} → ${item.answer.trim()}`)
    .join('\n')

  const parsed = await chatJson<RawPlan>(
    [
      {
        role: 'system',
        content: `${PLAN_PROMPT} Write summary, day names, focus, exercise names and descriptions in ${LANGUAGE_NAME[language]}.`,
      },
      {
        role: 'user',
        content: [
          `Athlete profile: ${profileSummary(profile)}`,
          `Request: ${request.trim()}`,
          answered ? `Answers to your questions:\n${answered}` : 'The athlete answered no extra questions.',
          `Exercise catalogue (id | name | muscle group | equipment):\n${catalogueList(profile)}`,
        ].join('\n\n'),
      },
    ],
    config,
    { maxTokens: 2200, signal, temperature: 0.4 },
  )

  // Exercícios inventados primeiro: os dias validam contra eles.
  const newExercises: Exercise[] = []
  const newById = new Map<string, Exercise>()
  for (const item of Array.isArray(parsed.newExercises) ? parsed.newExercises : []) {
    const name = typeof item.name === 'string' ? item.name.trim() : ''
    if (!name) continue
    const id = `ai:${slug(typeof item.id === 'string' && item.id.trim() ? item.id : name)}`
    if (newById.has(id)) continue
    const description = typeof item.description === 'string' ? item.description.trim() : ''
    const exercise: Exercise = {
      id,
      name: localized(name, name),
      muscleGroup: oneOf(item.muscleGroup, MUSCLE_GROUPS, 'corpo_inteiro'),
      equipment: oneOf(item.equipment, EQUIPMENTS, profile.equipment),
      difficulty: oneOf(item.difficulty, LEVELS, profile.level),
      description: localized(description, description),
    }
    newExercises.push(exercise)
    newById.set(id, exercise)
  }

  const catalogueIds = new Set(
    availableExercises({ equipment: profile.equipment, level: 'avancado' }).map((exercise) => exercise.id),
  )
  /** Aceita o id tal como veio, ou a versão prefixada de um exercício novo. */
  const resolveId = (raw: unknown): string | undefined => {
    if (typeof raw !== 'string') return undefined
    const id = raw.trim()
    if (!id) return undefined
    if (catalogueIds.has(id)) return id
    if (newById.has(id)) return id
    const prefixed = `ai:${slug(id)}`
    return newById.has(prefixed) ? prefixed : undefined
  }

  const stamp = Date.now()
  const days: WorkoutDay[] = []
  const rawDays = Array.isArray(parsed.days) ? parsed.days : []
  rawDays.forEach((rawDay, index) => {
    const exercises: WorkoutExercise[] = []
    for (const rawExercise of Array.isArray(rawDay.exercises) ? rawDay.exercises : []) {
      const exerciseId = resolveId(rawExercise.id)
      if (!exerciseId || exercises.some((item) => item.exerciseId === exerciseId)) continue
      const reps =
        typeof rawExercise.reps === 'string' && rawExercise.reps.trim() ? rawExercise.reps.trim() : '10-12'
      exercises.push({
        exerciseId,
        sets: clamp(rawExercise.sets, 1, 10, 3),
        reps: reps.slice(0, 24),
        restSeconds: clamp(rawExercise.restSeconds ?? rawExercise.rest, 0, 600, 60),
      })
    }
    if (exercises.length === 0) return

    const name = (typeof rawDay.name === 'string' ? rawDay.name.trim() : '') || `#${index + 1}`
    const focus = typeof rawDay.focus === 'string' ? rawDay.focus.trim() : ''
    days.push({
      id: `ai-${stamp}-${index}`,
      // O texto vem numa só língua; é usado tal e qual nas duas, como nos treinos criados à mão.
      name: localized(name, name),
      focus: localized(focus, focus),
      dayOfWeek: clamp(rawDay.dayOfWeek, 0, 6, (index + 1) % 7),
      exercises,
      isCustom: true,
      difficulty: profile.level,
    })
  })

  // Só interessam os exercícios novos que algum dia acabou por usar.
  const usedIds = new Set(days.flatMap((day) => day.exercises.map((item) => item.exerciseId)))

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : '',
    days,
    newExercises: newExercises.filter((exercise) => usedIds.has(exercise.id)),
  }
}

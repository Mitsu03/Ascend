import { FOOD_BY_ID } from '@/data/foods'
import { computeTargets, totalXpForLevel, xpForLevel } from '@/services/calculations'
import { addDays, dayOfWeek, startOfWeek, today } from '@/services/dates'
import { generateWeeklyPlan, totalSets } from '@/services/planGenerator'
import { generateDailyQuests, generateWeeklyQuests } from '@/services/questGenerator'
import { INITIAL_GAME_STATE } from '@/store/gameStore'
import type { BodyLog, GameState, MealEntry, Quest, UserProfile, WorkoutDay, WorkoutSessionLog } from '@/types'

/**
 * Perfil de demonstração — permite explorar a app já povoada, sem passar pelo
 * onboarding. Todos os dados são fictícios.
 */

export const DEMO_PROFILE: UserProfile = {
  name: 'Kai',
  goal: 'ganhar_massa',
  level: 'intermedio',
  daysPerWeek: 4,
  equipment: 'ginasio',
  weightKg: 74,
  heightCm: 178,
  age: 24,
  sex: 'masculino',
  dietPreference: 'sem_preferencia',
  createdAt: new Date().toISOString(),
  avatarVariant: 1,
  avatarHue: 24,
}

export interface DemoData {
  profile: UserProfile
  game: GameState
  plan: WorkoutDay[]
  history: WorkoutSessionLog[]
  entries: MealEntry[]
  waterByDate: Record<string, number>
  daily: Quest[]
  weekly: Quest[]
  bodyLogs: BodyLog[]
}

/**
 * Roda o plano para que haja sempre um treino no dia em que a demo é aberta —
 * caso contrário a app abriria num "dia de descanso" e mostraria pouca coisa.
 */
function alignPlanToToday(plan: WorkoutDay[]): WorkoutDay[] {
  const current = dayOfWeek(today())
  if (plan.length === 0 || plan.some((day) => day.dayOfWeek === current)) return plan
  const delta = (current - plan[0].dayOfWeek + 7) % 7
  return plan.map((day) => ({ ...day, dayOfWeek: (day.dayOfWeek + delta) % 7 }))
}

function buildHistory(plan: WorkoutDay[]): WorkoutSessionLog[] {
  const logs: WorkoutSessionLog[] = []
  const start = addDays(today(), -21)
  for (let offset = 0; offset < 21; offset += 1) {
    const date = addDays(start, offset)
    const workout = plan.find((day) => day.dayOfWeek === dayOfWeek(date))
    if (!workout) continue
    // Um treino falhado a meio para o histórico parecer humano.
    if (offset === 9) continue
    const total = totalSets(workout.exercises)
    const completed = offset % 5 === 0 ? Math.round(total * 0.8) : total
    logs.push({
      id: `demo-session-${date}-${workout.id}`,
      workoutDayId: workout.id,
      workoutName: workout.name,
      date,
      durationSeconds: 2400 + ((offset * 137) % 900),
      completedSets: completed,
      totalSets: total,
      xpEarned: 40 + completed * 6 + (completed === total ? 30 : 0),
      coinsEarned: Math.round(10 + completed * 1.5),
    })
  }
  return logs.reverse()
}

const BREAKFAST: [string, number][] = [
  ['aveia', 60],
  ['skyr', 150],
  ['banana', 120],
]
const LUNCH: [string, number][] = [
  ['peito-frango', 170],
  ['arroz-cozido', 200],
  ['brocolos', 150],
  ['azeite', 10],
]
const SNACK: [string, number][] = [
  ['whey', 30],
  ['amendoas', 25],
]
const DINNER: [string, number][] = [
  ['salmao', 140],
  ['batata-doce', 180],
  ['salada-mista', 150],
]

function buildEntries(): MealEntry[] {
  const entries: MealEntry[] = []
  let seq = 0
  const push = (date: string, mealType: MealEntry['mealType'], items: [string, number][]) => {
    for (const [foodId, grams] of items) {
      seq += 1
      entries.push({ id: `demo-meal-${seq}`, date, mealType, foodId, grams })
    }
  }

  for (let offset = 7; offset >= 1; offset -= 1) {
    const date = addDays(today(), -offset)
    push(date, 'pequeno_almoco', BREAKFAST)
    push(date, 'almoco', LUNCH)
    if (offset % 2 === 0) push(date, 'lanche', SNACK)
    push(date, 'jantar', DINNER)
  }

  // Hoje: apenas pequeno-almoço e almoço registados (~60% da meta).
  const now = today()
  push(now, 'pequeno_almoco', BREAKFAST)
  push(now, 'almoco', LUNCH)

  return entries
}

function buildBodyLogs(): BodyLog[] {
  const weights = [74.8, 74.6, 74.9, 74.4, 74.2, 74.0]
  const waists = [82, 81.8, 82, 81.5, 81.4, 81.2]
  return weights.map((weightKg, index) => {
    const date = addDays(today(), -((weights.length - 1 - index) * 7))
    return {
      id: `demo-body-${date}`,
      date,
      weightKg,
      waistCm: waists[index],
    }
  })
}

export function buildDemoData(): DemoData {
  const profile = DEMO_PROFILE
  const targets = computeTargets(profile)
  const plan = alignPlanToToday(generateWeeklyPlan(profile))
  const history = buildHistory(plan)
  const entries = buildEntries()
  const now = today()
  const weekStart = startOfWeek(now)

  const waterByDate: Record<string, number> = { [now]: 1250 }
  for (let offset = 1; offset <= 7; offset += 1) {
    waterByDate[addDays(now, -offset)] = 2000 + ((offset * 250) % 1000)
  }

  // O progresso das missões acompanha os dados reais da demo, para o estado
  // apresentado ser coerente com o diário e o histórico.
  const proteinToday = entries
    .filter((entry) => entry.date === now)
    .reduce((sum, entry) => {
      const food = FOOD_BY_ID[entry.foodId]
      return sum + (food ? (food.per100g.proteinG * entry.grams) / 100 : 0)
    }, 0)

  const withDemoProgress = (quest: Quest, fallbackRatio: number): Quest => {
    let progress: number
    switch (quest.type) {
      case 'treino':
        // O treino de hoje ainda está por fazer — é o que se pode demonstrar.
        progress = quest.period === 'semanal' ? Math.min(quest.target, 2) : 0
        break
      case 'proteina':
        progress = quest.period === 'diaria' ? Math.round(proteinToday) : Math.min(quest.target, 3)
        break
      case 'agua':
        progress = quest.period === 'diaria' ? waterByDate[now] : 9000
        break
      default:
        progress = Math.round(quest.target * fallbackRatio)
    }
    progress = Math.max(0, Math.min(quest.target, progress))
    return { ...quest, progress, completed: progress >= quest.target }
  }

  const daily = generateDailyQuests(profile, targets, now, plan).map((quest, index) =>
    withDemoProgress(quest, index === 0 ? 0.6 : 0.35),
  )

  const weekly = generateWeeklyQuests(profile, targets, weekStart).map((quest, index) =>
    quest.period === 'especial' ? quest : withDemoProgress(quest, index === 0 ? 0.6 : 0.4),
  )

  const xpByDate: Record<string, number> = {}
  for (const log of history) {
    xpByDate[log.date] = (xpByDate[log.date] ?? 0) + log.xpEarned
  }

  const game: GameState = {
    ...INITIAL_GAME_STATE,
    xp: totalXpForLevel(7) + Math.round(xpForLevel(7) * 0.42),
    level: 7,
    coins: 320,
    attributes: { forca: 14, resistencia: 9, disciplina: 11, energia: 8 },
    streak: 5,
    bestStreak: 12,
    lastActiveDate: now,
    recoveryAvailable: true,
    unlockedAchievements: {
      'primeiro-passo': addDays(now, -20),
      'chama-acesa': addDays(now, -17),
      'semana-de-ferro': addDays(now, -12),
      'guerreiro-dedicado': addDays(now, -5),
    },
    inventory: ['titulo-novato', 'aura-ciano', 'moldura-ferro'],
    equipped: { title: 'titulo-novato', aura: 'aura-ciano', frame: 'moldura-ferro' },
    counters: {
      workouts: history.length,
      quests: 34,
      meals: entries.length,
      customWorkouts: 0,
      proteinDays: 6,
      weightLogs: 6,
    },
    proteinBonusDates: Array.from({ length: 6 }, (_, index) => addDays(now, -(index + 1))),
    xpByDate,
  }

  return {
    profile,
    game,
    plan,
    history,
    entries,
    waterByDate,
    daily,
    weekly,
    bodyLogs: buildBodyLogs(),
  }
}

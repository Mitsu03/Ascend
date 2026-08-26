import { EQUIPMENT_RANK, EXERCISES } from '@/data/exercises'
import { localized as l } from '@/i18n/types'
import type { Localized } from '@/i18n/types'
import type { Exercise, ExperienceLevel, Goal, MuscleGroup, UserProfile, WorkoutDay, WorkoutExercise } from '@/types'

/** Gera o plano semanal a partir das respostas do onboarding. */

const LEVEL_RANK: Record<ExperienceLevel, number> = {
  iniciante: 0,
  intermedio: 1,
  avancado: 2,
}

interface SetScheme {
  sets: number
  reps: string
  restSeconds: number
}

const GOAL_SCHEME: Record<Goal, SetScheme> = {
  ganhar_massa: { sets: 4, reps: '8-12', restSeconds: 90 },
  perder_gordura: { sets: 3, reps: '12-15', restSeconds: 60 },
  manter: { sets: 3, reps: '10-12', restSeconds: 75 },
  condicao_fisica: { sets: 3, reps: '12-15', restSeconds: 60 },
}

interface SplitDay {
  name: Localized
  focus: Localized
  groups: MuscleGroup[]
  includeCardio: boolean
}

const SPLITS: Record<number, SplitDay[]> = {
  2: [
    { name: l('Corpo Inteiro A', 'Full Body A'), focus: l('Força global', 'Overall strength'), groups: ['pernas', 'peito', 'costas', 'core'], includeCardio: true },
    { name: l('Corpo Inteiro B', 'Full Body B'), focus: l('Potência e core', 'Power and core'), groups: ['pernas', 'ombros', 'costas', 'bracos', 'core'], includeCardio: true },
  ],
  3: [
    { name: l('Corpo Inteiro A', 'Full Body A'), focus: l('Empurrar', 'Push'), groups: ['peito', 'ombros', 'bracos', 'core'], includeCardio: false },
    { name: l('Corpo Inteiro B', 'Full Body B'), focus: l('Puxar', 'Pull'), groups: ['costas', 'bracos', 'core'], includeCardio: true },
    { name: l('Corpo Inteiro C', 'Full Body C'), focus: l('Pernas e core', 'Legs and core'), groups: ['pernas', 'core', 'corpo_inteiro'], includeCardio: true },
  ],
  4: [
    { name: l('Superior A', 'Upper A'), focus: l('Peito, ombros e tríceps', 'Chest, shoulders and triceps'), groups: ['peito', 'ombros', 'bracos'], includeCardio: false },
    { name: l('Inferior A', 'Lower A'), focus: l('Quadríceps e glúteos', 'Quads and glutes'), groups: ['pernas', 'core'], includeCardio: false },
    { name: l('Superior B', 'Upper B'), focus: l('Costas e bíceps', 'Back and biceps'), groups: ['costas', 'bracos', 'ombros'], includeCardio: false },
    { name: l('Inferior B', 'Lower B'), focus: l('Posterior e core', 'Posterior chain and core'), groups: ['pernas', 'core', 'corpo_inteiro'], includeCardio: true },
  ],
  5: [
    { name: l('Empurrar', 'Push'), focus: l('Peito, ombros e tríceps', 'Chest, shoulders and triceps'), groups: ['peito', 'ombros', 'bracos'], includeCardio: false },
    { name: l('Puxar', 'Pull'), focus: l('Costas e bíceps', 'Back and biceps'), groups: ['costas', 'bracos'], includeCardio: false },
    { name: l('Pernas', 'Legs'), focus: l('Membros inferiores', 'Lower body'), groups: ['pernas', 'core'], includeCardio: false },
    { name: l('Superior', 'Upper'), focus: l('Volume no tronco', 'Upper-body volume'), groups: ['peito', 'costas', 'ombros'], includeCardio: false },
    { name: l('Cardio e Core', 'Cardio & Core'), focus: l('Condição física', 'Conditioning'), groups: ['cardio', 'core', 'corpo_inteiro'], includeCardio: true },
  ],
  6: [
    { name: l('Empurrar A', 'Push A'), focus: l('Peito e ombros', 'Chest and shoulders'), groups: ['peito', 'ombros', 'bracos'], includeCardio: false },
    { name: l('Puxar A', 'Pull A'), focus: l('Costas e bíceps', 'Back and biceps'), groups: ['costas', 'bracos'], includeCardio: false },
    { name: l('Pernas A', 'Legs A'), focus: l('Quadríceps', 'Quads'), groups: ['pernas', 'core'], includeCardio: false },
    { name: l('Empurrar B', 'Push B'), focus: l('Tríceps e peito', 'Triceps and chest'), groups: ['peito', 'bracos', 'ombros'], includeCardio: false },
    { name: l('Puxar B', 'Pull B'), focus: l('Dorsais e trapézio', 'Lats and traps'), groups: ['costas', 'bracos'], includeCardio: false },
    { name: l('Pernas B e Cardio', 'Legs B & Cardio'), focus: l('Posterior e condição', 'Posterior chain and conditioning'), groups: ['pernas', 'cardio', 'core'], includeCardio: true },
  ],
}

/** Dias da semana escolhidos, evitando dias consecutivos sempre que possível. */
const DAY_LAYOUTS: Record<number, number[]> = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
}

export function availableExercises(profile: Pick<UserProfile, 'equipment' | 'level'>): Exercise[] {
  const maxEquipment = EQUIPMENT_RANK[profile.equipment]
  const maxLevel = LEVEL_RANK[profile.level]
  return EXERCISES.filter(
    (exercise) => EQUIPMENT_RANK[exercise.equipment] <= maxEquipment && LEVEL_RANK[exercise.difficulty] <= maxLevel,
  )
}

/** Escolhe exercícios preferindo os que exigem mais equipamento disponível. */
function pickForGroup(pool: Exercise[], group: MuscleGroup, count: number, used: Set<string>): Exercise[] {
  const candidates = pool
    .filter((exercise) => exercise.muscleGroup === group && !used.has(exercise.id))
    .sort((a, b) => EQUIPMENT_RANK[b.equipment] - EQUIPMENT_RANK[a.equipment])
  const picked = candidates.slice(0, count)
  for (const exercise of picked) used.add(exercise.id)
  return picked
}

function buildDayExercises(
  pool: Exercise[],
  split: SplitDay,
  scheme: SetScheme,
  goal: Goal,
): WorkoutExercise[] {
  const used = new Set<string>()
  const chosen: Exercise[] = []
  // Primeira passagem: 2 exercícios por grupo principal.
  for (const group of split.groups) {
    chosen.push(...pickForGroup(pool, group, 2, used))
    if (chosen.length >= 6) break
  }
  // Segunda passagem: completa com o que houver nos grupos do dia.
  if (chosen.length < 5) {
    for (const group of split.groups) {
      chosen.push(...pickForGroup(pool, group, 1, used))
      if (chosen.length >= 5) break
    }
  }
  // Fallback: se o catálogo filtrado for pequeno, usa corpo inteiro.
  if (chosen.length < 4) {
    chosen.push(...pickForGroup(pool, 'corpo_inteiro', 2, used))
    chosen.push(...pickForGroup(pool, 'core', 2, used))
  }

  const shouldAddCardio = split.includeCardio || goal === 'perder_gordura' || goal === 'condicao_fisica'
  const exercises = chosen.slice(0, 6)

  const result: WorkoutExercise[] = exercises.map((exercise) => {
    if (exercise.muscleGroup === 'core') {
      return { exerciseId: exercise.id, sets: 3, reps: '30-45 s', restSeconds: 45 }
    }
    if (exercise.muscleGroup === 'cardio') {
      return { exerciseId: exercise.id, sets: 1, reps: '15-20 min', restSeconds: 0 }
    }
    return { exerciseId: exercise.id, sets: scheme.sets, reps: scheme.reps, restSeconds: scheme.restSeconds }
  })

  if (shouldAddCardio && !result.some((item) => pool.find((e) => e.id === item.exerciseId)?.muscleGroup === 'cardio')) {
    const cardio = pickForGroup(pool, 'cardio', 1, used)[0]
    if (cardio) {
      result.push({ exerciseId: cardio.id, sets: 1, reps: '15-20 min', restSeconds: 0 })
    }
  }

  return result
}

export function generateWeeklyPlan(profile: UserProfile): WorkoutDay[] {
  const days = Math.min(6, Math.max(2, profile.daysPerWeek))
  const split = SPLITS[days] ?? SPLITS[4]
  const layout = DAY_LAYOUTS[days] ?? DAY_LAYOUTS[4]
  const pool = availableExercises(profile)
  const scheme = GOAL_SCHEME[profile.goal]

  return split.map((splitDay, index) => ({
    id: `plan-${index + 1}`,
    name: splitDay.name,
    focus: splitDay.focus,
    dayOfWeek: layout[index] ?? ((index + 1) % 7),
    exercises: buildDayExercises(pool, splitDay, scheme, profile.goal),
    isCustom: false,
    difficulty: profile.level,
  }))
}

/** Duração estimada de um treino, em minutos. */
export function estimateDuration(exercises: WorkoutExercise[]): number {
  const seconds = exercises.reduce((total, item) => {
    if (item.reps.includes('min')) {
      const minutes = Number.parseInt(item.reps, 10)
      return total + (Number.isFinite(minutes) ? minutes * 60 : 900)
    }
    const workPerSet = 45
    return total + item.sets * (workPerSet + item.restSeconds)
  }, 0)
  return Math.max(10, Math.round(seconds / 60))
}

export function totalSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, item) => total + item.sets, 0)
}

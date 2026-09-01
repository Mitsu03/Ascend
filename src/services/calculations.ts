import type { Goal, MacroTargets, UserProfile } from '@/types'

/**
 * Estimativas energéticas e curva de progressão.
 *
 * IMPORTANTE: os valores calculados aqui são estimativas para gestão pessoal.
 * Não constituem aconselhamento médico ou nutricional.
 */

/** Metabolismo basal — equação de Mifflin-St Jeor. */
export function basalMetabolicRate(profile: Pick<UserProfile, 'weightKg' | 'heightCm' | 'age' | 'sex'>): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  return profile.sex === 'masculino' ? base + 5 : base - 161
}

/** Fator de atividade derivado dos dias de treino por semana. */
export function activityFactor(daysPerWeek: number): number {
  if (daysPerWeek <= 2) return 1.375
  if (daysPerWeek <= 4) return 1.465
  if (daysPerWeek === 5) return 1.55
  return 1.65
}

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  perder_gordura: -0.15,
  ganhar_massa: 0.1,
  manter: 0,
  condicao_fisica: 0,
}

const GOAL_PROTEIN_PER_KG: Record<Goal, number> = {
  perder_gordura: 2.0,
  ganhar_massa: 1.8,
  manter: 1.6,
  condicao_fisica: 1.7,
}

export function totalDailyEnergyExpenditure(profile: UserProfile): number {
  return basalMetabolicRate(profile) * activityFactor(profile.daysPerWeek)
}

/** Calorias e macronutrientes estimados para o perfil. */
export function computeTargets(profile: UserProfile): MacroTargets {
  const tdee = totalDailyEnergyExpenditure(profile)
  const adjusted = tdee * (1 + GOAL_CALORIE_ADJUSTMENT[profile.goal])
  // Piso de segurança para não sugerir défices agressivos.
  const floor = profile.sex === 'masculino' ? 1500 : 1200
  const calories = Math.max(floor, Math.round(adjusted / 10) * 10)

  const proteinG = Math.round(profile.weightKg * GOAL_PROTEIN_PER_KG[profile.goal])
  const fatG = Math.max(Math.round(profile.weightKg * 0.8), Math.round((calories * 0.25) / 9))
  const remaining = calories - proteinG * 4 - fatG * 9
  const carbsG = Math.max(50, Math.round(remaining / 4))

  return { calories, proteinG, carbsG, fatG }
}

/**
 * Meta diária de água. Fica aqui e não no ecrã da nutrição porque o Quartel
 * também a mostra — duas cópias do número davam duas metas diferentes.
 */
export const WATER_GOAL_ML = 2500

// ---------------------------------------------------------------- Níveis e XP

/** XP necessário para passar do nível `level` para o seguinte. */
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5))
}

/** XP total acumulado necessário para atingir o nível `level`. */
export function totalXpForLevel(level: number): number {
  let total = 0
  for (let l = 1; l < level; l += 1) total += xpForLevel(l)
  return total
}

export interface LevelInfo {
  level: number
  /** XP já feito dentro do nível atual */
  currentLevelXp: number
  /** XP necessário para completar o nível atual */
  nextLevelXp: number
  progress: number
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1
  let remaining = Math.max(0, xp)
  // Teto de 99 para evitar ciclos infinitos com valores absurdos.
  while (level < 99 && remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level += 1
  }
  const nextLevelXp = xpForLevel(level)
  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp,
    progress: Math.min(1, remaining / nextLevelXp),
  }
}

/** Patentes do Gotei 13, da alma sem lâmina ao Capitão-Comandante. */
export type LevelTitleKey =
  | 'alma'
  | 'academia'
  | 'shinigami'
  | 'oficial'
  | 'terceiro'
  | 'tenente'
  | 'capitao'
  | 'comandante'

export const LEVEL_TITLES: { minLevel: number; key: LevelTitleKey }[] = [
  { minLevel: 1, key: 'alma' },
  { minLevel: 3, key: 'academia' },
  { minLevel: 5, key: 'shinigami' },
  { minLevel: 7, key: 'oficial' },
  { minLevel: 10, key: 'terceiro' },
  { minLevel: 14, key: 'tenente' },
  { minLevel: 18, key: 'capitao' },
  { minLevel: 25, key: 'comandante' },
]

export function titleKeyForLevel(level: number): LevelTitleKey {
  let key: LevelTitleKey = LEVEL_TITLES[0].key
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.minLevel) key = entry.key
  }
  return key
}

/**
 * Estado da máscara de Hollow por patente.
 *
 * A máscara só aparece a partir de Terceiro Oficial e segue a ordem em que se
 * domina o poder: primeiro mal se forma, depois aguenta rachada, e só no fim
 * fica inteira. `undefined` significa sem máscara.
 */
export function maskStageForLevel(level: number): 'nascente' | 'rachada' | 'plena' | undefined {
  if (level >= 18) return 'plena'
  if (level >= 14) return 'rachada'
  if (level >= 10) return 'nascente'
  return undefined
}

// ---------------------------------------------------------------- Recompensas

export interface WorkoutRewards {
  xp: number
  coins: number
  completionRate: number
}

/** XP e moedas de uma sessão de treino. */
export function workoutRewards(completedSets: number, totalSets: number, durationSeconds: number): WorkoutRewards {
  const completionRate = totalSets > 0 ? completedSets / totalSets : 0
  const base = 40 + completedSets * 6
  const perfectBonus = completionRate >= 1 ? 30 : 0
  // Bónus de duração modesto: 1 XP por minuto, até 20.
  const durationBonus = Math.min(20, Math.floor(durationSeconds / 60))
  const xp = Math.round(base + perfectBonus + durationBonus)
  const coins = Math.round(10 + completedSets * 1.5 + (completionRate >= 1 ? 10 : 0))
  return { xp, coins, completionRate }
}

/** Probabilidade de recompensa cosmética aleatória após um treino. */
export const BONUS_REWARD_CHANCE = 0.22

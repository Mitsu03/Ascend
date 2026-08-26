import type { Localized } from '@/i18n/types'

/**
 * Modelo de domínio da Ascend.
 * Todas as datas em formato 'YYYY-MM-DD' salvo indicação em contrário.
 */

export type Goal = 'perder_gordura' | 'ganhar_massa' | 'manter' | 'condicao_fisica'
export type ExperienceLevel = 'iniciante' | 'intermedio' | 'avancado'
export type Equipment = 'nenhum' | 'halteres' | 'ginasio'
export type Sex = 'masculino' | 'feminino'
export type DietPreference = 'sem_preferencia' | 'vegetariano' | 'vegan' | 'mediterranica'

export interface UserProfile {
  name: string
  goal: Goal
  level: ExperienceLevel
  daysPerWeek: number
  equipment: Equipment
  weightKg: number
  heightCm: number
  age: number
  sex: Sex
  dietPreference: DietPreference
  /** ISO datetime */
  createdAt: string
  /** Identificador da variante de avatar escolhida */
  avatarVariant: number
  avatarHue: number
}

export interface MacroTargets {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export type AttributeKey = 'forca' | 'resistencia' | 'disciplina' | 'energia'
export type Attributes = Record<AttributeKey, number>

export interface GameState {
  xp: number
  level: number
  coins: number
  attributes: Attributes
  streak: number
  bestStreak: number
  /** Último dia com atividade registada */
  lastActiveDate: string
  /** Dia de recuperação disponível (reposto a cada 7 dias de streak) */
  recoveryAvailable: boolean
  unlockedAchievements: Record<string, string>
  inventory: string[]
  equipped: {
    frame?: string
    title?: string
    aura?: string
  }
  /** Contadores usados por conquistas e estatísticas */
  counters: {
    workouts: number
    quests: number
    meals: number
    customWorkouts: number
    proteinDays: number
    weightLogs: number
  }
  /** Datas em que já foi atribuído o bónus de proteína, para não duplicar */
  proteinBonusDates: string[]
  /** Histórico de XP acumulado por dia, para gráficos */
  xpByDate: Record<string, number>
}

// ---------------------------------------------------------------- Treino

export type MuscleGroup =
  | 'peito'
  | 'costas'
  | 'pernas'
  | 'ombros'
  | 'bracos'
  | 'core'
  | 'cardio'
  | 'corpo_inteiro'

export interface Exercise {
  id: string
  name: Localized
  muscleGroup: MuscleGroup
  equipment: Equipment
  difficulty: ExperienceLevel
  description: Localized
}

export interface WorkoutExercise {
  exerciseId: string
  sets: number
  reps: string
  restSeconds: number
}

export interface WorkoutDay {
  id: string
  /** Nos treinos personalizados o texto do utilizador é usado nas duas línguas. */
  name: Localized
  focus: Localized
  /** 0 = Domingo … 6 = Sábado */
  dayOfWeek: number
  exercises: WorkoutExercise[]
  isCustom: boolean
  difficulty: ExperienceLevel
}

export interface WorkoutSessionLog {
  id: string
  workoutDayId: string
  workoutName: Localized
  date: string
  durationSeconds: number
  completedSets: number
  totalSets: number
  xpEarned: number
  coinsEarned: number
  bonusRewardId?: string
}

export interface ActiveSession {
  workoutDayId: string
  /** epoch ms */
  startedAt: number
  /** Segundos acumulados antes da última pausa */
  accumulatedSeconds: number
  paused: boolean
  /** checked[indiceExercicio][indiceSerie] */
  checked: boolean[][]
}

// ---------------------------------------------------------------- Nutrição

export type FoodCategory =
  | 'proteina'
  | 'hidratos'
  | 'gordura'
  | 'lacticinios'
  | 'fruta'
  | 'vegetais'
  | 'refeicao'
  | 'snack'
  | 'bebida'

export type MealType = 'pequeno_almoco' | 'almoco' | 'lanche' | 'jantar' | 'snack'

export interface Food {
  id: string
  name: Localized
  category: FoodCategory
  /** Valores por 100 g (ou 100 ml em bebidas) */
  per100g: {
    calories: number
    proteinG: number
    carbsG: number
    fatG: number
  }
  commonPortionG: number
  portionLabel: Localized
  /** Dietas com que é compatível. Vazio = compatível com todas. */
  diets: DietPreference[]
}

export interface MealEntry {
  id: string
  date: string
  mealType: MealType
  foodId: string
  grams: number
  /**
   * Cópia do alimento quando ele não vem do catálogo local (código de barras
   * ou reconhecimento por fotografia), para o registo continuar legível mesmo
   * sem rede.
   */
  food?: Food
  /** Miniatura JPEG (data URL) da fotografia da refeição. */
  photo?: string
}

/** Origem de um alimento registado, usada para o rótulo na UI. */
export type FoodSource = 'catalogo' | 'codigo_barras' | 'fotografia'

export interface DailyTotals {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface MealSuggestion {
  id: string
  headline: string
  detail: string
  foodIds: string[]
  totals: DailyTotals
}

// ---------------------------------------------------------------- Missões

export type QuestType = 'treino' | 'passos' | 'agua' | 'proteina' | 'sono' | 'habito'
export type QuestPeriod = 'diaria' | 'semanal' | 'especial'

export interface QuestTemplate {
  id: string
  type: QuestType
  period: QuestPeriod
  title: Localized
  description: Localized
  unit: Localized
  /** Alvo base; pode ser ajustado ao perfil pelo gerador */
  baseTarget: number
  rewardXp: number
  rewardCoins: number
  rewardItem?: string
  /** Progresso introduzido manualmente pelo utilizador */
  manualStep?: number
  attribute: AttributeKey
}

export interface Quest {
  id: string
  templateId: string
  type: QuestType
  period: QuestPeriod
  title: Localized
  description: Localized
  unit: Localized
  target: number
  progress: number
  rewardXp: number
  rewardCoins: number
  rewardItem?: string
  manualStep?: number
  attribute: AttributeKey
  completed: boolean
  /** Dia (diária/especial) ou segunda-feira da semana (semanal) */
  date: string
  /** Missões especiais só contam depois de aceites */
  accepted: boolean
  replaced: boolean
}

// ---------------------------------------------------------------- Progresso

export interface Achievement {
  id: string
  title: Localized
  description: Localized
  icon: string
  target: number
  metric:
    | 'workouts'
    | 'streak'
    | 'level'
    | 'proteinDays'
    | 'quests'
    | 'meals'
    | 'customWorkouts'
    | 'weightLogs'
  rewardXp: number
  rewardCoins: number
}

export interface BodyLog {
  id: string
  date: string
  weightKg: number
  waistCm?: number
  notes?: string
}

export type CosmeticSlot = 'frame' | 'title' | 'aura'
export type Rarity = 'comum' | 'raro' | 'epico'

export interface CosmeticItem {
  id: string
  name: Localized
  slot: CosmeticSlot
  rarity: Rarity
  description: Localized
  price: number
  /** Valor aplicado pela UI (cor, gradiente ou texto) */
  value: string
}

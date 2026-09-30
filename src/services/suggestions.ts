import { FOODS } from '@/data/foods'
import { candidatesFor, pairingsAgree } from '@/data/foodRoles'
import { CURATED_COMBOS } from '@/data/mealCombos'
import { lastNDays } from '@/services/dates'
import type { ComboRole, RoledFood } from '@/data/foodRoles'
import type { ComboFocus } from '@/data/mealCombos'
import type { Dictionary } from '@/i18n'
import type { Language } from '@/i18n/types'
import type {
  DailyTotals,
  DietPreference,
  Food,
  MealEntry,
  MealSuggestion,
  MealType,
} from '@/types'

/**
 * Sugestões de refeições com base nos macros que faltam.
 *
 * O conjunto de propostas sai de duas fontes: os combos escritos à mão em
 * `mealCombos` e combinações montadas na hora a partir do catálogo, seguindo
 * os papéis definidos em `foodRoles`. Sobre esse conjunto aplica-se um
 * ranking que penaliza o que já foi comido nos últimos dias e mistura ruído
 * estável pela semente, para as sugestões não serem sempre as mesmas.
 *
 * São combinações automáticas de alimentos do catálogo — não substituem
 * aconselhamento clínico ou nutricional.
 */

interface Remaining {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

const MAX_SUGGESTIONS = 3
/** Alimentos considerados por papel antes de montar as combinações. */
const CANDIDATES_PER_ROLE = 6
/** Desconto a um candidato cujo perfil de macros já saiu nesta ronda. */
const FOCUS_REPEAT_PENALTY = 0.06
/** Dias de histórico que contam para a penalização de repetição. */
const RECENCY_DAYS = 5

/** Tecto calórico razoável para cada refeição, para o snack não valer um jantar. */
const MEAL_CALORIE_CAP: Record<MealType, number> = {
  pequeno_almoco: 600,
  almoco: 850,
  lanche: 350,
  jantar: 850,
  snack: 300,
}

const FOOD_MAP = new Map(FOODS.map((food) => [food.id, food]))

// ------------------------------------------------------------------- Macros

function macrosFor(food: Food, grams: number): DailyTotals {
  const factor = grams / 100
  return {
    calories: Math.round(food.per100g.calories * factor),
    proteinG: Math.round(food.per100g.proteinG * factor),
    carbsG: Math.round(food.per100g.carbsG * factor),
    fatG: Math.round(food.per100g.fatG * factor),
  }
}

function sumTotals(items: DailyTotals[]): DailyTotals {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      proteinG: acc.proteinG + item.proteinG,
      carbsG: acc.carbsG + item.carbsG,
      fatG: acc.fatG + item.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  )
}

/** Repartição calórica entre proteína, hidratos e gordura. */
function macroSplit(macros: { proteinG: number; carbsG: number; fatG: number }) {
  const protein = macros.proteinG * 4
  const carbs = macros.carbsG * 4
  const fat = macros.fatG * 9
  const total = protein + carbs + fat
  if (total <= 0) return { protein: 1 / 3, carbs: 1 / 3, fat: 1 / 3 }
  return { protein: protein / total, carbs: carbs / total, fat: fat / total }
}

/**
 * Proximidade entre a repartição calórica de um alimento e a do que falta.
 * 0..1. Serve só para pré-seleccionar candidatos por papel — o ajuste fino aos
 * macros é feito depois, sobre a combinação inteira, em `macroScore`.
 */
function splitAffinity(food: Food, goal: Remaining): number {
  const a = macroSplit(food.per100g)
  const b = macroSplit(goal)
  const distance = Math.abs(a.protein - b.protein) + Math.abs(a.carbs - b.carbs) + Math.abs(a.fat - b.fat)
  return 1 - distance / 2
}

function closeness(actual: number, target: number, floor: number): number {
  return 1 - Math.min(1, Math.abs(actual - target) / Math.max(target, floor))
}

/** Quão bem uma combinação cobre o objetivo da refeição. 0..1. */
function macroScore(totals: DailyTotals, goal: Remaining): number {
  return (
    0.3 * closeness(totals.calories, goal.calories, 200) +
    0.4 * closeness(totals.proteinG, goal.proteinG, 20) +
    0.15 * closeness(totals.carbsG, goal.carbsG, 40) +
    0.15 * closeness(totals.fatG, goal.fatG, 15)
  )
}

function focusOf(totals: DailyTotals): ComboFocus {
  const split = macroSplit(totals)
  if (split.fat >= 0.42) return 'gordura'
  if (split.protein >= 0.3) return 'proteina'
  if (split.carbs >= 0.5) return 'hidratos'
  return 'equilibrado'
}

// -------------------------------------------------------------- Aleatoriedade

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Ruído estável em [0, 1) — igual para a mesma semente, diferente entre dias. */
function jitter(seed: string, key: string): number {
  return hashString(`${seed}|${key}`) / 4294967296
}

// ------------------------------------------------------------------ Histórico

/**
 * Peso de repetição por alimento, de 1 (comido hoje) a 0,2 (há cinco dias).
 * É o que evita propor frango com arroz no dia a seguir a frango com arroz.
 */
export function recentFoodWeights(entries: MealEntry[], date: string): Map<string, number> {
  const window = lastNDays(RECENCY_DAYS, date)
  const weightByDate = new Map(window.map((day, index) => [day, (index + 1) / RECENCY_DAYS]))
  const weights = new Map<string, number>()
  for (const entry of entries) {
    const weight = weightByDate.get(entry.date)
    if (weight === undefined) continue
    weights.set(entry.foodId, Math.max(weights.get(entry.foodId) ?? 0, weight))
  }
  return weights
}

function repeatPenalty(foodIds: string[], recency: Map<string, number>): number {
  if (foodIds.length === 0) return 0
  let sum = 0
  let peak = 0
  for (const id of foodIds) {
    const weight = recency.get(id) ?? 0
    sum += weight
    peak = Math.max(peak, weight)
  }
  return (sum / foodIds.length + peak) / 2
}

// ------------------------------------------------------------------- Refeição

/**
 * A refeição a que as sugestões dizem respeito: a que a hora indica, saltando
 * para a seguinte quando essa já está registada.
 */
export function inferMealSlot(loggedMeals: MealType[], hour: number = new Date().getHours()): MealType {
  // De madrugada ainda é a noite anterior: propõe-se algo leve, não um pequeno-almoço.
  if (hour < 5) return 'snack'
  const order: MealType[] = ['pequeno_almoco', 'almoco', 'lanche', 'jantar', 'snack']
  /** Hora a partir da qual deixa de fazer sentido propor cada refeição. */
  const until = [11, 15, 19, 22, 24]
  const logged = new Set(loggedMeals)
  for (let i = 0; i < order.length; i += 1) {
    if (hour < until[i] && !logged.has(order[i])) return order[i]
  }
  return 'snack'
}

// ------------------------------------------------------------------- Combos

interface Candidate {
  foodIds: string[]
  label: string
  /** Combos escritos à mão ganham desempates contra os gerados. */
  curated: boolean
}

const TEMPLATES: { meals: MealType[]; roles: ComboRole[] }[] = [
  { meals: ['pequeno_almoco'], roles: ['lacticinio', 'hidrato', 'fruta'] },
  { meals: ['pequeno_almoco'], roles: ['proteina', 'hidrato', 'fruta'] },
  { meals: ['pequeno_almoco'], roles: ['proteina', 'hidrato', 'gordura'] },
  { meals: ['lanche', 'snack'], roles: ['fruta', 'gordura'] },
  { meals: ['lanche', 'snack'], roles: ['lacticinio', 'fruta'] },
  { meals: ['lanche', 'snack'], roles: ['lacticinio', 'hidrato', 'fruta'] },
  { meals: ['lanche', 'snack'], roles: ['proteina', 'hidrato'] },
  { meals: ['almoco', 'jantar'], roles: ['proteina', 'hidrato', 'vegetal'] },
  { meals: ['almoco', 'jantar'], roles: ['proteina', 'vegetal', 'gordura'] },
  { meals: ['almoco', 'jantar'], roles: ['hidrato', 'vegetal', 'gordura'] },
]

/**
 * O alimento que dá nome a uma combinação gerada. Os modelos põem sempre a
 * âncora (proteína, lacticínio ou hidrato) em primeiro lugar.
 */
function anchorName(foodIds: string[], language: Language): string {
  const food = FOOD_MAP.get(foodIds[0])
  return food ? food.name[language] : ''
}

function isCompatible(foodIds: string[], diet: DietPreference): boolean {
  if (diet === 'sem_preferencia') return true
  return foodIds.every((id) => FOOD_MAP.get(id)?.diets.includes(diet))
}

/** Os melhores alimentos de um papel para esta refeição, já com ruído da semente. */
function pickCandidates(
  role: ComboRole,
  meal: MealType,
  diet: DietPreference,
  goal: Remaining,
  recency: Map<string, number>,
  seed: string,
): RoledFood[] {
  return candidatesFor(role, meal)
    .filter((item) => diet === 'sem_preferencia' || item.food.diets.includes(diet))
    .map((item) => ({
      item,
      score:
        splitAffinity(item.food, goal) -
        0.6 * (recency.get(item.food.id) ?? 0) +
        0.55 * jitter(seed, `${role}:${item.food.id}`),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATES_PER_ROLE)
    .map((entry) => entry.item)
}

/** Produto cartesiano dos candidatos, deixando cair os pratos incoerentes. */
function expand(groups: RoledFood[][]): string[][] {
  const combos = groups.reduce<RoledFood[][]>(
    (acc, group) => acc.flatMap((prefix) => group.map((item) => [...prefix, item])),
    [[]],
  )
  return combos
    .filter((items) => pairingsAgree(items.map((item) => item.pairing)))
    .map((items) => items.map((item) => item.food.id))
}

function buildCandidates(
  meal: MealType,
  diet: DietPreference,
  goal: Remaining,
  recency: Map<string, number>,
  seed: string,
  language: Language,
): Candidate[] {
  const candidates: Candidate[] = []
  const seen = new Set<string>()

  for (const combo of CURATED_COMBOS) {
    if (!combo.meals.includes(meal)) continue
    if (!isCompatible(combo.foodIds, diet)) continue
    const key = combo.foodIds.join('+')
    seen.add(key)
    candidates.push({ foodIds: combo.foodIds, label: combo.label[language], curated: true })
  }

  for (const template of TEMPLATES) {
    if (!template.meals.includes(meal)) continue
    const groups = template.roles.map((role) => pickCandidates(role, meal, diet, goal, recency, seed))
    if (groups.some((group) => group.length === 0)) continue
    for (const foodIds of expand(groups)) {
      const key = foodIds.join('+')
      if (seen.has(key)) continue
      seen.add(key)
      // O rótulo dos gerados depende dos macros, por isso só se escreve
      // depois de as porções estarem escaladas.
      candidates.push({ foodIds, label: '', curated: false })
    }
  }

  return candidates
}

/** Escala as porções do combo para se aproximar do objetivo da refeição. */
function scaleCombo(foodIds: string[], goal: Remaining): DailyTotals {
  const foods = foodIds.map((id) => FOOD_MAP.get(id)).filter((food): food is Food => Boolean(food))
  const baseGrams = foods.map((food) => food.commonPortionG)
  const baseTotals = sumTotals(foods.map((food, index) => macrosFor(food, baseGrams[index])))
  if (baseTotals.calories === 0) return baseTotals

  const factor = Math.min(1.6, Math.max(0.5, goal.calories / baseTotals.calories))
  const grams = foods.map((_, index) => Math.round((baseGrams[index] * factor) / 5) * 5)
  return sumTotals(foods.map((food, index) => macrosFor(food, grams[index])))
}

// ------------------------------------------------------------------- Frases

function gapSentence(remaining: Remaining, t: Dictionary): string {
  const parts: string[] = []
  if (remaining.proteinG >= 5) parts.push(t.nutrition.gapProtein(remaining.proteinG))
  if (remaining.carbsG >= 10) parts.push(t.nutrition.gapCarbs(remaining.carbsG))
  if (remaining.fatG >= 5) parts.push(t.nutrition.gapFat(remaining.fatG))
  if (parts.length === 0) return t.nutrition.gapCalories(remaining.calories)
  const last = parts.pop() as string
  const list = parts.length > 0 ? `${parts.join(', ')}${t.nutrition.listJoin}${last}` : last
  return t.nutrition.gapSentence(list)
}

// ------------------------------------------------------------------- Público

export interface SuggestionInput {
  remaining: Remaining
  diet: DietPreference
  meal: MealType
  /** Peso de repetição por alimento — ver `recentFoodWeights`. */
  recency: Map<string, number>
  /** Semente estável: muda com o dia, a refeição e cada pedido de outra ronda. */
  seed: string
  t: Dictionary
  language: Language
}

export interface SuggestionResult {
  /** Mensagem quando não há sugestões a dar (meta praticamente atingida). */
  message: string | null
  meal: MealType
  suggestions: MealSuggestion[]
}

export function suggestMeals(input: SuggestionInput): SuggestionResult {
  const { remaining, diet, meal, recency, seed, t, language } = input

  if (remaining.calories < 100) {
    return {
      message: remaining.calories <= 0 ? t.nutrition.goalReached : t.nutrition.almostThere,
      meal,
      suggestions: [],
    }
  }

  // O objetivo é a fatia desta refeição no que falta, não o dia inteiro.
  const targetCalories = Math.min(remaining.calories, MEAL_CALORIE_CAP[meal])
  const share = targetCalories / Math.max(remaining.calories, 1)
  const goal: Remaining = {
    calories: targetCalories,
    proteinG: remaining.proteinG * share,
    carbsG: remaining.carbsG * share,
    fatG: remaining.fatG * share,
  }

  const headline = gapSentence(remaining, t)
  const ceiling = targetCalories * 1.15 + 60

  const scored = buildCandidates(meal, diet, goal, recency, seed, language)
    .map((candidate) => {
      const totals = scaleCombo(candidate.foodIds, goal)
      const score =
        macroScore(totals, goal) -
        0.5 * repeatPenalty(candidate.foodIds, recency) +
        0.18 * jitter(seed, candidate.foodIds.join('+')) +
        (candidate.curated ? 0.06 : 0)
      return { candidate, totals, score }
    })
    .sort((a, b) => b.score - a.score)

  const withinCeiling = scored.filter((item) => item.totals.calories <= ceiling)
  const pool = withinCeiling.length > 0 ? withinCeiling : scored

  // Escolha gulosa sem repetir alimentos nem o mesmo perfil de macros, para as
  // três propostas não serem três variações do mesmo prato.
  const suggestions: MealSuggestion[] = []
  const usedFoods = new Set<string>()
  const usedFocus = new Set<ComboFocus>()
  while (suggestions.length < MAX_SUGGESTIONS) {
    let best: { item: (typeof pool)[number]; focus: ComboFocus; score: number } | null = null
    for (const item of pool) {
      if (item.candidate.foodIds.some((id) => usedFoods.has(id))) continue
      const focus = focusOf(item.totals)
      const score = item.score - (usedFocus.has(focus) ? FOCUS_REPEAT_PENALTY : 0)
      if (!best || score > best.score) best = { item, focus, score }
    }
    if (!best) break

    const { item, focus } = best
    for (const id of item.candidate.foodIds) usedFoods.add(id)
    usedFocus.add(focus)
    suggestions.push({
      id: item.candidate.foodIds.join('+'),
      headline,
      detail: item.candidate.curated
        ? item.candidate.label
        : t.nutrition.comboTitle(t.nutrition.comboMeals[meal], anchorName(item.candidate.foodIds, language)),
      foodIds: item.candidate.foodIds,
      totals: item.totals,
    })
  }

  return { message: null, meal, suggestions }
}

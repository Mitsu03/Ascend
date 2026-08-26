import { FOODS } from '@/data/foods'
import { localized as l } from '@/i18n/types'
import type { Dictionary } from '@/i18n'
import type { Language, Localized } from '@/i18n/types'
import type { DailyTotals, DietPreference, Food, MealSuggestion } from '@/types'

/**
 * Sugestões de refeições com base nos macros que faltam.
 * São combinações automáticas de alimentos do catálogo — não substituem
 * aconselhamento clínico ou nutricional.
 */

interface Remaining {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

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

/** Combinações base — a mais adequada é escolhida pelo macro em falta. */
const COMBOS: {
  foodIds: string[]
  label: Localized
  focus: 'proteina' | 'hidratos' | 'gordura' | 'equilibrado'
}[] = [
  {
    foodIds: ['skyr', 'aveia', 'banana'],
    label: l('Iogurte skyr + aveia + banana', 'Skyr yoghurt + oats + banana'),
    focus: 'proteina',
  },
  {
    foodIds: ['peito-frango', 'arroz-cozido', 'brocolos'],
    label: l('Frango + arroz + brócolos', 'Chicken + rice + broccoli'),
    focus: 'equilibrado',
  },
  {
    foodIds: ['atum-lata', 'pao-integral', 'tomate'],
    label: l('Tosta de atum com tomate', 'Tuna and tomato on wholemeal toast'),
    focus: 'proteina',
  },
  {
    foodIds: ['ovos', 'pao-mistura', 'abacate'],
    label: l('Ovos + pão + abacate', 'Eggs + bread + avocado'),
    focus: 'gordura',
  },
  {
    foodIds: ['whey', 'leite-meio-gordo'],
    label: l('Batido de proteína com leite', 'Protein shake with milk'),
    focus: 'proteina',
  },
  {
    foodIds: ['tofu', 'quinoa', 'espinafres'],
    label: l('Tofu salteado + quinoa + espinafres', 'Sautéed tofu + quinoa + spinach'),
    focus: 'proteina',
  },
  {
    foodIds: ['lentilhas', 'salada-mista', 'azeite'],
    label: l('Lentilhas com salada e fio de azeite', 'Lentils with salad and a drizzle of olive oil'),
    focus: 'equilibrado',
  },
  {
    foodIds: ['batata-doce', 'peito-frango'],
    label: l('Batata-doce assada + frango', 'Baked sweet potato + chicken'),
    focus: 'hidratos',
  },
  {
    foodIds: ['requeijao', 'tostas-integrais', 'morangos'],
    label: l('Requeijão + tostas + morangos', 'Curd cheese + crispbread + strawberries'),
    focus: 'hidratos',
  },
  {
    foodIds: ['amendoas', 'maca'],
    label: l('Maçã com amêndoas', 'Apple with almonds'),
    focus: 'gordura',
  },
  {
    foodIds: ['salmao', 'batata-cozida', 'salada-mista'],
    label: l('Salmão + batata + salada', 'Salmon + potato + salad'),
    focus: 'gordura',
  },
  {
    foodIds: ['grao-de-bico', 'courgette', 'azeite'],
    label: l('Grão salteado com courgette', 'Sautéed chickpeas with courgette'),
    focus: 'equilibrado',
  },
  {
    foodIds: ['barra-proteina'],
    label: l('Barra de proteína', 'Protein bar'),
    focus: 'proteina',
  },
  {
    foodIds: ['sopa-legumes', 'pao-integral'],
    label: l('Sopa de legumes + pão', 'Vegetable soup + bread'),
    focus: 'hidratos',
  },
]

const FOOD_MAP = new Map(FOODS.map((food) => [food.id, food]))

function comboIsCompatible(foodIds: string[], diet: DietPreference): boolean {
  if (diet === 'sem_preferencia') return true
  return foodIds.every((id) => FOOD_MAP.get(id)?.diets.includes(diet))
}

/** Escala as porções do combo para se aproximar das calorias que faltam. */
function scaleCombo(foodIds: string[], remaining: Remaining): { grams: number[]; totals: DailyTotals } {
  const foods = foodIds.map((id) => FOOD_MAP.get(id)).filter((food): food is Food => Boolean(food))
  const baseGrams = foods.map((food) => food.commonPortionG)
  const baseTotals = sumTotals(foods.map((food, index) => macrosFor(food, baseGrams[index])))

  if (baseTotals.calories === 0) return { grams: baseGrams, totals: baseTotals }

  const targetCalories = Math.min(remaining.calories, 900)
  const rawFactor = targetCalories / baseTotals.calories
  const factor = Math.min(1.6, Math.max(0.5, rawFactor))

  const grams = foods.map((_, index) => Math.round((baseGrams[index] * factor) / 5) * 5)
  const totals = sumTotals(foods.map((food, index) => macrosFor(food, grams[index])))
  return { grams, totals }
}

function dominantGap(remaining: Remaining): 'proteina' | 'hidratos' | 'gordura' | 'equilibrado' {
  if (remaining.proteinG >= 20) return 'proteina'
  if (remaining.carbsG >= 45) return 'hidratos'
  if (remaining.fatG >= 18) return 'gordura'
  return 'equilibrado'
}

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

export interface SuggestionResult {
  /** Mensagem quando não há sugestões a dar (meta praticamente atingida). */
  message: string | null
  suggestions: MealSuggestion[]
}

export function suggestMeals(
  remaining: Remaining,
  diet: DietPreference,
  t: Dictionary,
  language: Language,
): SuggestionResult {
  if (remaining.calories < 100) {
    return {
      message: remaining.calories <= 0 ? t.nutrition.goalReached : t.nutrition.almostThere,
      suggestions: [],
    }
  }

  const focus = dominantGap(remaining)
  const headline = gapSentence(remaining, t)

  const compatible = COMBOS.filter((combo) => comboIsCompatible(combo.foodIds, diet))
  const ranked = [...compatible].sort((a, b) => {
    const scoreA = a.focus === focus ? 0 : a.focus === 'equilibrado' ? 1 : 2
    const scoreB = b.focus === focus ? 0 : b.focus === 'equilibrado' ? 1 : 2
    return scoreA - scoreB
  })

  const suggestions: MealSuggestion[] = []
  for (const combo of ranked) {
    if (suggestions.length >= 3) break
    const { totals } = scaleCombo(combo.foodIds, remaining)
    // Evita sugerir algo que estoure claramente as calorias restantes.
    if (totals.calories > remaining.calories * 1.15 + 60) continue
    suggestions.push({
      id: combo.foodIds.join('+'),
      headline,
      detail: combo.label[language],
      foodIds: combo.foodIds,
      totals,
    })
  }

  if (suggestions.length === 0 && ranked.length > 0) {
    const combo = ranked[0]
    const { totals } = scaleCombo(combo.foodIds, remaining)
    suggestions.push({
      id: combo.foodIds.join('+'),
      headline,
      detail: combo.label[language],
      foodIds: combo.foodIds,
      totals,
    })
  }

  return { message: null, suggestions }
}

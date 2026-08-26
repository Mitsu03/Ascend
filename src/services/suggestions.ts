import { FOODS } from '@/data/foods'
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
const COMBOS: { foodIds: string[]; label: string; focus: 'proteina' | 'hidratos' | 'gordura' | 'equilibrado' }[] = [
  { foodIds: ['skyr', 'aveia', 'banana'], label: 'Iogurte skyr + aveia + banana', focus: 'proteina' },
  { foodIds: ['peito-frango', 'arroz-cozido', 'brocolos'], label: 'Frango + arroz + brócolos', focus: 'equilibrado' },
  { foodIds: ['atum-lata', 'pao-integral', 'tomate'], label: 'Tosta de atum com tomate', focus: 'proteina' },
  { foodIds: ['ovos', 'pao-mistura', 'abacate'], label: 'Ovos + pão + abacate', focus: 'gordura' },
  { foodIds: ['whey', 'leite-meio-gordo'], label: 'Batido de proteína com leite', focus: 'proteina' },
  { foodIds: ['tofu', 'quinoa', 'espinafres'], label: 'Tofu salteado + quinoa + espinafres', focus: 'proteina' },
  { foodIds: ['lentilhas', 'salada-mista', 'azeite'], label: 'Lentilhas com salada e fio de azeite', focus: 'equilibrado' },
  { foodIds: ['batata-doce', 'peito-frango'], label: 'Batata-doce assada + frango', focus: 'hidratos' },
  { foodIds: ['requeijao', 'tostas-integrais', 'morangos'], label: 'Requeijão + tostas + morangos', focus: 'hidratos' },
  { foodIds: ['amendoas', 'maca'], label: 'Maçã com amêndoas', focus: 'gordura' },
  { foodIds: ['salmao', 'batata-cozida', 'salada-mista'], label: 'Salmão + batata + salada', focus: 'gordura' },
  { foodIds: ['grao-de-bico', 'courgette', 'azeite'], label: 'Grão salteado com courgette', focus: 'equilibrado' },
  { foodIds: ['barra-proteina'], label: 'Barra de proteína', focus: 'proteina' },
  { foodIds: ['sopa-legumes', 'pao-integral'], label: 'Sopa de legumes + pão', focus: 'hidratos' },
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

function gapSentence(remaining: Remaining): string {
  const parts: string[] = []
  if (remaining.proteinG >= 5) parts.push(`${remaining.proteinG} g de proteína`)
  if (remaining.carbsG >= 10) parts.push(`${remaining.carbsG} g de hidratos`)
  if (remaining.fatG >= 5) parts.push(`${remaining.fatG} g de gordura`)
  if (parts.length === 0) return `Faltam ${remaining.calories} kcal.`
  const last = parts.pop()
  const list = parts.length > 0 ? `${parts.join(', ')} e ${last}` : last
  return `Faltam ${list}.`
}

export interface SuggestionResult {
  /** Mensagem quando não há sugestões a dar (meta praticamente atingida). */
  message: string | null
  suggestions: MealSuggestion[]
}

export function suggestMeals(remaining: Remaining, diet: DietPreference = 'sem_preferencia'): SuggestionResult {
  if (remaining.calories < 100) {
    return {
      message:
        remaining.calories <= 0
          ? 'Meta calórica atingida. Ótimo trabalho — o resto do dia é para recuperar.'
          : 'Estás praticamente na meta. Se tiveres fome, opta por algo leve como fruta ou iogurte.',
      suggestions: [],
    }
  }

  const focus = dominantGap(remaining)
  const headline = gapSentence(remaining)

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
      detail: combo.label,
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
      detail: combo.label,
      foodIds: combo.foodIds,
      totals,
    })
  }

  return { message: null, suggestions }
}

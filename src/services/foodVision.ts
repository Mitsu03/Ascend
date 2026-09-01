import { FOODS, normalize } from '@/data/foods'
import { localized } from '@/i18n/types'
import { stripDataUrl } from '@/services/photos'
import {
  AiNotConfiguredError,
  AiRequestError,
  aiIsConfigured,
  chatJson,
} from '@/services/aiClient'
import type { AiConfig } from '@/services/aiClient'
import type { Language } from '@/i18n/types'
import type { Food } from '@/types'

/**
 * Reconhecimento de alimentos a partir de uma fotografia ou de uma descrição
 * escrita.
 *
 * O MVP não inclui nenhum modelo — não existe uma opção gratuita e fiável que
 * corra offline no browser. Em vez disso a app expõe uma camada de provider:
 * sem configuração, a foto fica anexada à refeição e o utilizador escolhe os
 * alimentos à mão; com um endpoint configurado nas Definições (a chave é do
 * próprio utilizador e nunca sai deste dispositivo a não ser para esse
 * endpoint), a foto ou o texto são analisados automaticamente.
 */

/** Mantido como `VisionConfig` porque é o nome usado no armazenamento local. */
export type VisionConfig = AiConfig

export interface FoodGuess {
  food: Food
  grams: number
  /** 0–1, tal como devolvido pelo modelo. Ausente quando não é fornecida. */
  confidence?: number
  /** Nome original devolvido pelo modelo, útil quando não há correspondência exata. */
  rawLabel: string
  /** true quando o alimento não existe no catálogo e foi criado a partir da resposta. */
  synthetic: boolean
}

export const VisionNotConfiguredError = AiNotConfiguredError
export const VisionRequestError = AiRequestError
export const visionIsConfigured = aiIsConfigured

const PHOTO_PROMPT = [
  'You identify foods in a photo of a meal and estimate portion weights.',
  'Reply with JSON only, no prose, in this exact shape:',
  '{"items":[{"name":"...","grams":123,"confidence":0.0,"calories":0,"protein":0,"carbs":0,"fat":0}]}',
  'name: the food in English, singular, generic (e.g. "grilled chicken breast").',
  'grams: estimated edible weight of that item in the photo.',
  'calories/protein/carbs/fat: per 100 g of that food.',
  'confidence: 0 to 1. Return an empty items array if the photo has no food.',
].join(' ')

const TEXT_PROMPT = [
  'You break a written meal description into its individual foods and estimate portion weights.',
  'The description may be in European Portuguese or English and may name a composite dish',
  '(e.g. "bitoque", "francesinha", "lasanha") — in that case list the ingredients that make it up,',
  'each as its own item, instead of a single line for the whole dish.',
  'Reply with JSON only, no prose, in this exact shape:',
  '{"items":[{"name":"...","grams":123,"confidence":0.0,"calories":0,"protein":0,"carbs":0,"fat":0}]}',
  'name: the food in English, singular, generic (e.g. "grilled chicken breast").',
  'grams: estimated edible weight actually eaten. Honour any quantity the user gives',
  '("2 eggs", "a bowl of", "200 g"); otherwise assume one typical portion.',
  'calories/protein/carbs/fat: per 100 g of that food.',
  'confidence: 0 to 1, lower when the description is vague.',
  'Return an empty items array if the text names no food.',
].join(' ')

interface VisionItem {
  name?: string
  grams?: number
  confidence?: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

/** Procura o alimento no catálogo local antes de criar um sintético. */
function matchCatalogue(label: string): Food | undefined {
  const needle = normalize(label)
  if (!needle) return undefined
  const exact = FOODS.find(
    (food) => normalize(food.name.en) === needle || normalize(food.name.pt) === needle,
  )
  if (exact) return exact
  return FOODS.find(
    (food) => normalize(food.name.en).includes(needle) || needle.includes(normalize(food.name.en)),
  )
}

function syntheticFood(item: VisionItem, label: string): Food | null {
  const calories = item.calories
  const protein = item.protein
  const carbs = item.carbs
  const fat = item.fat
  if (
    typeof calories !== 'number' ||
    typeof protein !== 'number' ||
    typeof carbs !== 'number' ||
    typeof fat !== 'number'
  ) {
    return null
  }
  return {
    id: `vision:${normalize(label).replace(/\s+/g, '-')}`,
    name: localized(label, label),
    category: 'refeicao',
    per100g: {
      calories: Math.max(0, Math.round(calories)),
      proteinG: Math.max(0, Math.round(protein * 10) / 10),
      carbsG: Math.max(0, Math.round(carbs * 10) / 10),
      fatG: Math.max(0, Math.round(fat * 10) / 10),
    },
    commonPortionG: 100,
    portionLabel: localized('100 g', '100 g'),
    diets: [],
  }
}

/** Converte a resposta do modelo em estimativas utilizáveis pela UI. */
function guessesFrom(items: VisionItem[], limit: number): FoodGuess[] {
  const guesses: FoodGuess[] = []
  for (const item of items) {
    const label = item.name?.trim()
    if (!label) continue
    const grams = typeof item.grams === 'number' && item.grams > 0 ? Math.round(item.grams) : 100

    const catalogue = matchCatalogue(label)
    if (catalogue) {
      guesses.push({
        food: catalogue,
        grams,
        confidence: item.confidence,
        rawLabel: label,
        synthetic: false,
      })
      continue
    }

    const synthetic = syntheticFood(item, label)
    if (synthetic) {
      guesses.push({ food: synthetic, grams, confidence: item.confidence, rawLabel: label, synthetic: true })
    }
  }

  // Ordena pelas estimativas mais fiáveis primeiro.
  return guesses.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)).slice(0, limit)
}

export async function recogniseFood(
  imageDataUrl: string,
  config: VisionConfig | null,
  signal?: AbortSignal,
): Promise<FoodGuess[]> {
  const parsed = await chatJson<{ items?: VisionItem[] }>(
    [
      { role: 'system', content: PHOTO_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Identify the foods and estimate portions.' },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${stripDataUrl(imageDataUrl)}` },
          },
        ],
      },
    ],
    config,
    { maxTokens: 700, signal, temperature: 0.2 },
  )

  return guessesFrom(Array.isArray(parsed.items) ? parsed.items : [], 6)
}

/**
 * Alternativa à fotografia: o utilizador escreve o que comeu e o serviço
 * devolve os ingredientes com gramas e valores por 100 g. Tal como na
 * fotografia, nada entra no diário sem confirmação.
 */
export async function recogniseFoodFromText(
  description: string,
  config: VisionConfig | null,
  signal?: AbortSignal,
): Promise<FoodGuess[]> {
  const text = description.trim()
  if (!text) return []

  const parsed = await chatJson<{ items?: VisionItem[] }>(
    [
      { role: 'system', content: TEXT_PROMPT },
      { role: 'user', content: `Meal description: ${text}` },
    ],
    config,
    { maxTokens: 900, signal, temperature: 0.2 },
  )

  return guessesFrom(Array.isArray(parsed.items) ? parsed.items : [], 10)
}

/** Rótulo mostrado na UI para uma estimativa. */
export function guessLabel(guess: FoodGuess, language: Language): string {
  return guess.food.name[language] || guess.rawLabel
}

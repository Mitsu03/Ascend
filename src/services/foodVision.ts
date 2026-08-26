import { FOODS, normalize } from '@/data/foods'
import { localized } from '@/i18n/types'
import { stripDataUrl } from '@/services/photos'
import type { Language } from '@/i18n/types'
import type { Food } from '@/types'

/**
 * Reconhecimento de alimentos a partir de uma fotografia.
 *
 * O MVP não inclui nenhum modelo de visão — não existe uma opção gratuita e
 * fiável que corra offline no browser. Em vez disso a app expõe uma camada de
 * provider: sem configuração, a foto fica anexada à refeição e o utilizador
 * escolhe os alimentos à mão; com um endpoint de visão configurado nas
 * Definições (a chave é do próprio utilizador e nunca sai deste dispositivo
 * a não ser para esse endpoint), a foto é analisada automaticamente.
 */

export interface VisionConfig {
  /** Endpoint compatível com a API de chat da OpenAI. */
  endpoint: string
  apiKey: string
  model: string
}

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

export class VisionNotConfiguredError extends Error {}
export class VisionRequestError extends Error {}

const SYSTEM_PROMPT = [
  'You identify foods in a photo of a meal and estimate portion weights.',
  'Reply with JSON only, no prose, in this exact shape:',
  '{"items":[{"name":"...","grams":123,"confidence":0.0,"calories":0,"protein":0,"carbs":0,"fat":0}]}',
  'name: the food in English, singular, generic (e.g. "grilled chicken breast").',
  'grams: estimated edible weight of that item in the photo.',
  'calories/protein/carbs/fat: per 100 g of that food.',
  'confidence: 0 to 1. Return an empty items array if the photo has no food.',
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

/** Extrai o objeto JSON de uma resposta que pode vir embrulhada em ```json. */
function parseJsonPayload(text: string): { items?: VisionItem[] } {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = (fenced ? fenced[1] : text).trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) throw new VisionRequestError('resposta sem JSON')
  return JSON.parse(candidate.slice(start, end + 1))
}

export function visionIsConfigured(config: VisionConfig | null): config is VisionConfig {
  return Boolean(config?.endpoint?.trim() && config?.apiKey?.trim() && config?.model?.trim())
}

export async function recogniseFood(
  imageDataUrl: string,
  config: VisionConfig | null,
  signal?: AbortSignal,
): Promise<FoodGuess[]> {
  if (!visionIsConfigured(config)) throw new VisionNotConfiguredError()

  const response = await fetch(config.endpoint.trim(), {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: config.model.trim(),
      max_tokens: 700,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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
    }),
  })

  if (!response.ok) {
    throw new VisionRequestError(`HTTP ${response.status}`)
  }

  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const text = body.choices?.[0]?.message?.content
  if (!text) throw new VisionRequestError('resposta vazia')

  const parsed = parseJsonPayload(text)
  const items = Array.isArray(parsed.items) ? parsed.items : []

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
  return guesses.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)).slice(0, 6)
}

/** Rótulo mostrado na UI para uma estimativa. */
export function guessLabel(guess: FoodGuess, language: Language): string {
  return guess.food.name[language] || guess.rawLabel
}

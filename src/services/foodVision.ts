import { FOODS, normalize } from '@/data/foods'
import { LANGUAGE_NAMES, localized } from '@/i18n/types'
import {
  AiNotConfiguredError,
  AiRequestError,
  aiIsConfigured,
  chatJson,
} from '@/services/aiClient'
import { stripDataUrl } from '@/services/photos'
import type { AiConfig } from '@/services/aiClient'
import type { Language, Localized } from '@/i18n/types'
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

/**
 * O transporte — cabeçalhos, tempo limite, erros e a queda para o modelo
 * seguinte — vive no `aiClient`, partilhado com o gerador de planos de treino.
 * Aqui ficam só os prompts e a normalização dos alimentos. Os nomes antigos
 * mantêm-se como alias porque as Definições e o perfil os importam assim.
 */
export type VisionConfig = AiConfig
export const VisionNotConfiguredError = AiNotConfiguredError
export const VisionRequestError = AiRequestError
export const visionIsConfigured = aiIsConfigured

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

/**
 * O nome em inglês é o que casa com o catálogo (`matchCatalogue`), por isso
 * continua a ser pedido sempre; o `localName` é o que a UI mostra quando o
 * alimento não existe no catálogo — sem ele a app em português acabava com
 * uma lista de ingredientes em inglês.
 */
function shapeRules(language: Language): string[] {
  return [
    'Reply with JSON only, no prose, in this exact shape:',
    '{"items":[{"name":"...","localName":"...","grams":123,"confidence":0.0,"calories":0,"protein":0,"carbs":0,"fat":0}]}',
    'name: the food in English, singular, generic (e.g. "grilled chicken breast").',
    `localName: the same food written in ${LANGUAGE_NAMES[language]}, singular, generic.`,
    language === 'en' ? 'localName is identical to name.' : 'localName must never be in English.',
    'calories/protein/carbs/fat: per 100 g of that food.',
  ]
}

function photoPrompt(language: Language): string {
  return [
    'You identify foods in a photo of a meal and estimate portion weights.',
    ...shapeRules(language),
    'grams: estimated edible weight of that item in the photo.',
    'confidence: 0 to 1. Return an empty items array if the photo has no food.',
  ].join(' ')
}

/**
 * Um prato composto escrito à mão — "bitoque", "francesinha" — tem de sair
 * decomposto em ingredientes: registado numa linha só, não há forma de o
 * utilizador corrigir a quantidade da carne sem mexer no arroz.
 */
function textPrompt(language: Language): string {
  return [
    'You break a written meal description into its individual foods and estimate portion weights.',
    `The description may be in ${LANGUAGE_NAMES[language]} or English and may name a composite dish`,
    '(e.g. "bitoque", "francesinha", "lasanha") — in that case list the ingredients that make it up,',
    'each as its own item, instead of a single line for the whole dish.',
    ...shapeRules(language),
    'grams: estimated edible weight actually eaten. Honour any quantity the user gives',
    '("2 eggs", "a bowl of", "200 g"); otherwise assume one typical portion.',
    'confidence: 0 to 1, lower when the description is vague.',
    'Return an empty items array if the text names no food.',
  ].join(' ')
}

interface VisionItem {
  name?: string
  localName?: string
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

/**
 * O nome do alimento nas duas línguas: o inglês vem do modelo tal como o
 * catálogo o escreveria, a língua ativa recebe o `localName` quando existe.
 */
function syntheticName(label: string, local: string, language: Language): Localized {
  return language === 'pt' ? localized(local, label) : localized(label, local)
}

function syntheticFood(
  item: VisionItem,
  label: string,
  local: string,
  language: Language,
): Food | null {
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
    name: syntheticName(label, local, language),
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


/** Converte a resposta do modelo em estimativas prontas para a UI. */
function guessesFrom(items: VisionItem[], language: Language, limit: number): FoodGuess[] {
  const guesses: FoodGuess[] = []
  for (const item of items) {
    // Modelos que ignoram o `name` em inglês devolvem só o nome na língua
    // ativa; nesse caso ele serve para ambas as coisas.
    const label = item.name?.trim() || item.localName?.trim()
    if (!label) continue
    const local = item.localName?.trim() || label
    const grams = typeof item.grams === 'number' && item.grams > 0 ? Math.round(item.grams) : 100

    const catalogue = matchCatalogue(label) ?? matchCatalogue(local)
    if (catalogue) {
      guesses.push({
        food: catalogue,
        grams,
        confidence: item.confidence,
        rawLabel: local,
        synthetic: false,
      })
      continue
    }

    const synthetic = syntheticFood(item, label, local, language)
    if (synthetic) {
      guesses.push({ food: synthetic, grams, confidence: item.confidence, rawLabel: local, synthetic: true })
    }
  }

  // Ordena pelas estimativas mais fiáveis primeiro.
  return guesses.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)).slice(0, limit)
}

/** Reconhece os alimentos de uma fotografia do prato. */
export async function recogniseFood(
  imageDataUrl: string,
  config: VisionConfig | null,
  language: Language,
  signal?: AbortSignal,
): Promise<FoodGuess[]> {
  const parsed = await chatJson<{ items?: VisionItem[] }>(
    [
      { role: 'system', content: photoPrompt(language) },
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
    { signal, temperature: 0.2 },
  )

  return guessesFrom(Array.isArray(parsed.items) ? parsed.items : [], language, 6)
}

/**
 * Alternativa à fotografia: o utilizador escreve o que comeu e o serviço
 * devolve os ingredientes com gramas e valores por 100 g. Tal como na
 * fotografia, nada entra no diário sem confirmação.
 */
export async function recogniseFoodFromText(
  description: string,
  config: VisionConfig | null,
  language: Language,
  signal?: AbortSignal,
): Promise<FoodGuess[]> {
  const text = description.trim()
  if (!text) return []

  const parsed = await chatJson<{ items?: VisionItem[] }>(
    [
      { role: 'system', content: textPrompt(language) },
      { role: 'user', content: `Meal description: ${text}` },
    ],
    config,
    { signal, temperature: 0.2 },
  )

  return guessesFrom(Array.isArray(parsed.items) ? parsed.items : [], language, 10)
}

/** Rótulo mostrado na UI para uma estimativa. */
export function guessLabel(guess: FoodGuess, language: Language): string {
  return guess.food.name[language] || guess.rawLabel
}

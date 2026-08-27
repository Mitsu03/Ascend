import { FOODS, normalize } from '@/data/foods'
import { LANGUAGE_NAMES, localized } from '@/i18n/types'
import { stripDataUrl } from '@/services/photos'
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

export class VisionRequestError extends Error {
  /** Mensagem devolvida pelo serviço, quando existe — distingue chave errada de modelo errado. */
  detail?: string
  /** Código HTTP, quando o pedido chegou a ter resposta. */
  status?: number

  constructor(message: string, detail?: string, status?: number) {
    super(message)
    this.detail = detail
    this.status = status
  }
}

/**
 * Cadeia de modelos do Gemini, do mais recente para o mais antigo.
 *
 * O nível gratuito conta os pedidos diários **por modelo**, não por chave: o
 * `3.6-flash` dá 20 por dia e os `lite` dão 500 cada um. Esgotado um, a app
 * desce a lista em vez de dizer ao utilizador que acabou.
 *
 * Os dois `gemini-2.5-*` foram retirados e respondem 404 apesar de ainda
 * aparecerem na listagem de modelos da API — daí a queda ser accionada também
 * por 404 e não só por 429. O `gemini-3.7-flash` existe e podia abrir a lista;
 * ficou de fora por a cadeia ter sido pedida com quatro.
 */
export const GEMINI_FALLBACK_CHAIN = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
]

/** Só o Gemini: mandar estes nomes para o OpenRouter ou o Groq dava 404 em cadeia. */
function isGeminiEndpoint(endpoint: string): boolean {
  return endpoint.trim().toLowerCase().includes('generativelanguage.googleapis.com')
}

/**
 * Falhas em que vale a pena tentar o modelo seguinte: quota esgotada (429),
 * modelo retirado ou inexistente (404) e avaria do lado do serviço (5xx).
 *
 * Chave errada (401/403) não entra: nenhum modelo da lista ia funcionar e o
 * utilizador ficava à espera de quatro pedidos para receber o mesmo erro.
 * Tempos esgotados também não — quatro tentativas de 90 s eram seis minutos.
 */
function worthRetryingOnNextModel(cause: unknown): boolean {
  if (!(cause instanceof VisionRequestError) || cause.status === undefined) return false
  return cause.status === 429 || cause.status === 404 || cause.status >= 500
}

/**
 * O nome em inglês é o que casa com o catálogo (`matchCatalogue`), por isso
 * continua a ser pedido sempre; o `localName` é o que a UI mostra quando o
 * alimento não existe no catálogo — sem ele a app em português acabava com
 * uma lista de ingredientes em inglês.
 */
function systemPrompt(language: Language): string {
  return [
    'You identify foods in a photo of a meal and estimate portion weights.',
    'Reply with JSON only, no prose, in this exact shape:',
    '{"items":[{"name":"...","localName":"...","grams":123,"confidence":0.0,"calories":0,"protein":0,"carbs":0,"fat":0}]}',
    'name: the food in English, singular, generic (e.g. "grilled chicken breast").',
    `localName: the same food written in ${LANGUAGE_NAMES[language]}, singular, generic.`,
    language === 'en' ? 'localName is identical to name.' : 'localName must never be in English.',
    'grams: estimated edible weight of that item in the photo.',
    'calories/protein/carbs/fat: per 100 g of that food.',
    'confidence: 0 to 1. Return an empty items array if the photo has no food.',
  ].join(' ')
}

/**
 * Orçamento de resposta.
 *
 * Generoso de propósito: os modelos de raciocínio (Gemini 3.x, entre outros)
 * gastam tokens a pensar antes de escrever, e esses contam para o limite. Com
 * um valor apertado o JSON sai truncado a meio e o `parseJsonPayload` rejeita
 * a resposta inteira — o sintoma é «não foi identificado nenhum alimento» numa
 * fotografia perfeitamente legível.
 */
const MAX_TOKENS = 4000

/**
 * Tempo limite do pedido.
 *
 * Sem isto o `fetch` fica pendurado indefinidamente e a app mostra «a
 * analisar…» para sempre — visto de fora, é indistinguível de uma avaria.
 */
const TIMEOUT_MS = 90_000

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

/**
 * Uma tentativa, num modelo concreto. O `recogniseFood` é que decide se vale
 * a pena repetir no seguinte.
 */
async function attemptRecognition(
  imageDataUrl: string,
  config: VisionConfig,
  model: string,
  language: Language,
  signal?: AbortSignal,
): Promise<FoodGuess[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey.trim()}`,
  }
  // O OpenRouter pede estes cabeçalhos para atribuir o tráfego à aplicação.
  if (config.endpoint.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = window.location.origin
    headers['X-Title'] = 'Ascend'
  }

  // Sem rede não vale a pena esperar: o `fetch` fica pendurado até ao limite e
  // o utilizador leva 90 s a saber uma coisa que o dispositivo já sabia.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new VisionRequestError('sem ligação', 'o dispositivo está sem rede')
  }

  // Sem tempo limite o `fetch` fica pendurado e a app mostra «a analisar…»
  // para sempre — visto de fora é indistinguível de uma avaria.
  const timeout = new AbortController()
  let timedOut = false
  const timer = window.setTimeout(() => {
    timedOut = true
    timeout.abort()
  }, TIMEOUT_MS)
  signal?.addEventListener('abort', () => timeout.abort(), { once: true })

  // Tamanho do que vai ser enviado: quando o pedido estoira o tempo limite,
  // saber se foram 100 kB ou 3 MB é a diferença entre «a rede estava má» e
  // «a imagem ia demasiado grande».
  const payloadImage = stripDataUrl(imageDataUrl)
  const payloadKb = Math.round((payloadImage.length * 3) / 4 / 1024)
  const startedAt = Date.now()

  let response: Response
  try {
    response = await fetch(config.endpoint.trim(), {
      method: 'POST',
      signal: timeout.signal,
      headers,
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt(language) },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify the foods and estimate portions.' },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${payloadImage}` },
              },
            ],
          },
        ],
      }),
    })
  } catch (cause) {
    // Cancelamento pedido de fora não é falha: deixa-o passar tal como veio.
    if (signal?.aborted) throw cause
    if (timedOut) {
      throw new VisionRequestError(
        'tempo esgotado',
        `sem resposta em ${TIMEOUT_MS / 1000} s com uma imagem de ${payloadKb} kB`,
      )
    }
    // Rede ou CORS. A mensagem do browser é o que distingue «sem ligação» de
    // «o servidor recusou a origem» — sem ela ficava só «não foi possível
    // analisar», sem pista nenhuma para quem tenta perceber o que se passou.
    const seconds = Math.round((Date.now() - startedAt) / 1000)
    throw new VisionRequestError(
      'falha de rede',
      `${cause instanceof Error ? cause.message : String(cause)} (ao fim de ${seconds} s)`,
    )
  } finally {
    window.clearTimeout(timer)
  }

  if (!response.ok) {
    // A mensagem do serviço é o que distingue "modelo errado" de "chave errada".
    let detail: string | undefined
    try {
      const failure = (await response.json()) as { error?: { message?: string } | string }
      detail = typeof failure.error === 'string' ? failure.error : failure.error?.message
    } catch {
      /* corpo não é JSON — fica só o código de estado */
    }
    throw new VisionRequestError(`HTTP ${response.status}`, detail, response.status)
  }

  const body = (await response.json()) as {
    choices?: { finish_reason?: string; message?: { content?: string } }[]
  }
  const choice = body.choices?.[0]
  const text = choice?.message?.content
  if (!text) {
    throw new VisionRequestError('resposta vazia', choice?.finish_reason && `finish_reason: ${choice.finish_reason}`)
  }

  let parsed: { items?: VisionItem[] }
  try {
    parsed = parseJsonPayload(text)
  } catch (cause) {
    // Nos modelos de raciocínio o limite de tokens é gasto a pensar antes de
    // escrever, e o JSON sai cortado a meio. Sem esta distinção o sintoma era
    // «não foi possível analisar» numa fotografia perfeitamente legível.
    if (choice?.finish_reason === 'length') {
      throw new VisionRequestError(
        'resposta truncada',
        'o modelo esgotou o limite de tokens antes de fechar o JSON',
      )
    }
    throw cause
  }
  const items = Array.isArray(parsed.items) ? parsed.items : []

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
  return guesses.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)).slice(0, 6)
}

/**
 * Reconhece os alimentos de uma fotografia, descendo a cadeia de modelos
 * quando o primeiro não está disponível.
 */
export async function recogniseFood(
  imageDataUrl: string,
  config: VisionConfig | null,
  language: Language,
  signal?: AbortSignal,
): Promise<FoodGuess[]> {
  if (!visionIsConfigured(config)) throw new VisionNotConfiguredError()

  const configured = config.model.trim()
  // O modelo escolhido nas Definições abre sempre a fila, mesmo que não esteja
  // na cadeia — quem o escreveu à mão quer aquele. A cadeia é o que vem a
  // seguir, sem repetir o que já foi tentado.
  const models = isGeminiEndpoint(config.endpoint)
    ? [configured, ...GEMINI_FALLBACK_CHAIN.filter((model) => model !== configured)]
    : [configured]

  let lastError: unknown
  for (const model of models) {
    try {
      return await attemptRecognition(imageDataUrl, config, model, language, signal)
    } catch (cause) {
      if (signal?.aborted) throw cause
      lastError = cause
      if (!worthRetryingOnNextModel(cause)) throw cause
    }
  }

  // Toda a cadeia recusou. A mensagem do último diz porquê — normalmente quota
  // esgotada em todos, o que só acontece depois de mais de mil análises no dia.
  if (lastError instanceof VisionRequestError) {
    throw new VisionRequestError(
      lastError.message,
      `${lastError.detail ?? 'sem detalhe'} — ${models.length} modelos tentados`,
      lastError.status,
    )
  }
  throw lastError
}

/** Rótulo mostrado na UI para uma estimativa. */
export function guessLabel(guess: FoodGuess, language: Language): string {
  return guess.food.name[language] || guess.rawLabel
}

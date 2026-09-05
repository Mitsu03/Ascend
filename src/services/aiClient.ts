/**
 * Camada partilhada de acesso a um serviço de IA compatível com a API de chat
 * da OpenAI.
 *
 * A app funciona inteiramente offline; a IA é sempre opcional e a chave é do
 * próprio utilizador, guardada apenas neste dispositivo (ver
 * `settingsStore`). Três funcionalidades assentam nesta camada:
 *
 * - reconhecimento de alimentos por fotografia (`foodVision`);
 * - reconhecimento de alimentos escritos à mão (`foodVision`);
 * - geração de planos de treino a partir de um pedido em texto (`aiPlanner`).
 *
 * Aqui vive só o transporte — cabeçalhos, tempo limite, erros e a queda para o
 * modelo seguinte. Os prompts ficam em quem os usa.
 */

/** Endpoint compatível com a API de chat da OpenAI. */
export interface AiConfig {
  endpoint: string
  apiKey: string
  model: string
}

export class AiNotConfiguredError extends Error {}

export class AiRequestError extends Error {
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

export function aiIsConfigured(config: AiConfig | null): config is AiConfig {
  return Boolean(config?.endpoint?.trim() && config?.apiKey?.trim() && config?.model?.trim())
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
  if (!(cause instanceof AiRequestError) || cause.status === undefined) return false
  return cause.status === 429 || cause.status === 404 || cause.status >= 500
}

/**
 * Orçamento de resposta por omissão.
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

/** Conteúdo de uma mensagem: texto simples ou blocos (texto + imagem). */
export type ChatContent =
  | string
  | ({ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } })[]

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: ChatContent
}

/** Extrai o objeto JSON de uma resposta que pode vir embrulhada numa cerca de código. */
export function parseJsonPayload<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = (fenced ? fenced[1] : text).trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) throw new AiRequestError('resposta sem JSON')
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T
  } catch {
    throw new AiRequestError('resposta com JSON inválido')
  }
}

export interface ChatOptions {
  maxTokens?: number
  signal?: AbortSignal
  /** Menos criatividade nas tarefas de estimativa; mais nas de planeamento. */
  temperature?: number
}

/** Uma tentativa, num modelo concreto. Quem chama é que decide se repete. */
async function attemptChat(
  messages: ChatMessage[],
  config: AiConfig,
  model: string,
  { maxTokens = MAX_TOKENS, signal, temperature }: ChatOptions,
): Promise<string> {
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
    throw new AiRequestError('sem ligação', 'o dispositivo está sem rede')
  }

  const timeout = new AbortController()
  let timedOut = false
  const timer = window.setTimeout(() => {
    timedOut = true
    timeout.abort()
  }, TIMEOUT_MS)
  signal?.addEventListener('abort', () => timeout.abort(), { once: true })

  const startedAt = Date.now()

  let response: Response
  try {
    response = await fetch(config.endpoint.trim(), {
      method: 'POST',
      signal: timeout.signal,
      headers,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(temperature === undefined ? {} : { temperature }),
        messages,
      }),
    })
  } catch (cause) {
    // Cancelamento pedido de fora não é falha: deixa-o passar tal como veio.
    if (signal?.aborted) throw cause
    if (timedOut) {
      throw new AiRequestError('tempo esgotado', `sem resposta em ${TIMEOUT_MS / 1000} s`)
    }
    // Rede ou CORS. A mensagem do browser é o que distingue «sem ligação» de
    // «o servidor recusou a origem» — sem ela ficava só «não foi possível
    // analisar», sem pista nenhuma para quem tenta perceber o que se passou.
    const seconds = Math.round((Date.now() - startedAt) / 1000)
    throw new AiRequestError(
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
    throw new AiRequestError(`HTTP ${response.status}`, detail, response.status)
  }

  const body = (await response.json()) as {
    choices?: { finish_reason?: string; message?: { content?: string } }[]
  }
  const choice = body.choices?.[0]
  const text = choice?.message?.content
  if (!text) {
    throw new AiRequestError(
      'resposta vazia',
      choice?.finish_reason ? `finish_reason: ${choice.finish_reason}` : undefined,
    )
  }

  // Nos modelos de raciocínio o limite de tokens é gasto a pensar antes de
  // escrever, e a resposta sai cortada a meio. Sem esta distinção o sintoma
  // era «não foi possível analisar» com um pedido perfeitamente legível.
  if (choice.finish_reason === 'length') {
    throw new AiRequestError(
      'resposta truncada',
      'o modelo esgotou o limite de tokens antes de fechar a resposta',
    )
  }

  return text
}

/**
 * Faz o pedido e devolve o texto bruto da resposta, descendo a cadeia de
 * modelos quando o escolhido não está disponível.
 */
export async function chat(
  messages: ChatMessage[],
  config: AiConfig | null,
  options: ChatOptions = {},
): Promise<string> {
  if (!aiIsConfigured(config)) throw new AiNotConfiguredError()

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
      return await attemptChat(messages, config, model, options)
    } catch (cause) {
      if (options.signal?.aborted) throw cause
      lastError = cause
      if (!worthRetryingOnNextModel(cause)) throw cause
    }
  }

  // Toda a cadeia recusou. A mensagem do último diz porquê — normalmente quota
  // esgotada em todos, o que só acontece depois de mais de mil pedidos no dia.
  if (lastError instanceof AiRequestError) {
    throw new AiRequestError(
      lastError.message,
      `${lastError.detail ?? 'sem detalhe'} — ${models.length} modelos tentados`,
      lastError.status,
    )
  }
  throw lastError
}

/** Pedido cuja resposta é obrigatoriamente um objeto JSON. */
export async function chatJson<T>(
  messages: ChatMessage[],
  config: AiConfig | null,
  options?: ChatOptions,
): Promise<T> {
  return parseJsonPayload<T>(await chat(messages, config, options))
}

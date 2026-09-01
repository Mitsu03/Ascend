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

  constructor(message: string, detail?: string) {
    super(message)
    this.detail = detail
  }
}

export function aiIsConfigured(config: AiConfig | null): config is AiConfig {
  return Boolean(config?.endpoint?.trim() && config?.apiKey?.trim() && config?.model?.trim())
}

/** Conteúdo de uma mensagem: texto simples ou blocos (texto + imagem). */
export type ChatContent =
  | string
  | ({ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } })[]

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: ChatContent
}

/** Extrai o objeto JSON de uma resposta que pode vir embrulhada em ```json. */
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

interface ChatOptions {
  maxTokens?: number
  signal?: AbortSignal
  /** Menos criatividade nas tarefas de estimativa; mais nas de planeamento. */
  temperature?: number
}

/** Faz o pedido e devolve o texto bruto da resposta. */
export async function chat(
  messages: ChatMessage[],
  config: AiConfig | null,
  { maxTokens = 900, signal, temperature }: ChatOptions = {},
): Promise<string> {
  if (!aiIsConfigured(config)) throw new AiNotConfiguredError()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey.trim()}`,
  }
  // O OpenRouter pede estes cabeçalhos para atribuir o tráfego à aplicação.
  if (config.endpoint.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = window.location.origin
    headers['X-Title'] = 'Ascend'
  }

  const response = await fetch(config.endpoint.trim(), {
    method: 'POST',
    signal,
    headers,
    body: JSON.stringify({
      model: config.model.trim(),
      max_tokens: maxTokens,
      ...(temperature === undefined ? {} : { temperature }),
      messages,
    }),
  })

  if (!response.ok) {
    // A mensagem do serviço é o que distingue "modelo errado" de "chave errada".
    let detail: string | undefined
    try {
      const failure = (await response.json()) as { error?: { message?: string } | string }
      detail = typeof failure.error === 'string' ? failure.error : failure.error?.message
    } catch {
      /* corpo não é JSON — fica só o código de estado */
    }
    throw new AiRequestError(`HTTP ${response.status}`, detail)
  }

  const body = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const text = body.choices?.[0]?.message?.content
  if (!text) throw new AiRequestError('resposta vazia')
  return text
}

/** Pedido cuja resposta é obrigatoriamente um objeto JSON. */
export async function chatJson<T>(
  messages: ChatMessage[],
  config: AiConfig | null,
  options?: ChatOptions,
): Promise<T> {
  return parseJsonPayload<T>(await chat(messages, config, options))
}

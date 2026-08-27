import { localized } from '@/i18n/types'
import type { Localized } from '@/i18n/types'

/**
 * Serviços de visão compatíveis com a API de chat da OpenAI, verificados a
 * partir do browser (todos respondem com CORS aberto).
 *
 * A chave é sempre do utilizador e fica apenas neste dispositivo. Como uma PWA
 * corre inteiramente no cliente, a chave é legível por quem tenha acesso ao
 * dispositivo — por isso os presets gratuitos, sem faturação associada, são os
 * recomendados.
 */
export interface VisionProviderPreset {
  id: string
  name: string
  endpoint: string
  suggestedModel: string
  /** Página onde o utilizador cria a chave. */
  keyUrl: string
  free: boolean
  note: Localized
}

export const VISION_PRESETS: VisionProviderPreset[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    // Um "lite" de propósito: o gargalo do nível gratuito é o número de
    // pedidos por dia, não os tokens. Os Flash de topo dão 20 pedidos diários
    // — quatro refeições fotografadas e uma tentativa falhada chegam ao teto —
    // enquanto os lite dão 500. Ler um prato não precisa do raciocínio dos
    // outros: nos testes identificou os mesmos alimentos em 1,7 s em vez de
    // 12 s, porque não gasta tokens a pensar antes de escrever.
    suggestedModel: 'gemini-3.5-flash-lite',
    keyUrl: 'https://aistudio.google.com/apikey',
    free: true,
    note: localized(
      'Nível gratuito com 500 análises por dia e boa leitura de pratos. A opção recomendada. Os modelos Flash sem “lite” só dão 20 por dia.',
      'Free tier with 500 analyses a day and solid plate reading. The recommended option. The Flash models without “lite” only allow 20 a day.',
    ),
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    suggestedModel: '',
    keyUrl: 'https://openrouter.ai/models?q=free',
    free: true,
    note: localized(
      'Agrega vários modelos, alguns gratuitos (terminam em “:free”). Escolhe um com visão e copia o nome exato para o campo do modelo.',
      'Aggregates several models, some free (they end in “:free”). Pick one with vision and copy its exact slug into the model field.',
    ),
  },
  {
    id: 'groq',
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    suggestedModel: '',
    keyUrl: 'https://console.groq.com/docs/models',
    free: true,
    note: localized(
      'Nível gratuito rápido, com limites por minuto mais apertados. Escolhe um modelo com visão na lista da consola.',
      'Fast free tier with tighter per-minute limits. Pick a vision-capable model from the console list.',
    ),
  },
  {
    id: 'openai',
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    suggestedModel: 'gpt-4o-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
    free: false,
    note: localized(
      'Pago por utilização. Se usares esta opção, cria uma chave dedicada e com limite de gastos.',
      'Pay per use. If you go this way, create a dedicated key with a spending limit.',
    ),
  },
]

export function presetForEndpoint(endpoint: string): VisionProviderPreset | undefined {
  const normalised = endpoint.trim().toLowerCase()
  return VISION_PRESETS.find((preset) => normalised.startsWith(preset.endpoint.toLowerCase()))
}

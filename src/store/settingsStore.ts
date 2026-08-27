import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from '@/services/storage'
import type { VisionConfig } from '@/services/foodVision'
import type { Language } from '@/i18n/types'

interface SettingsStore {
  language: Language
  /**
   * Endpoint de visão para o registo por fotografia. Fica a null por omissão:
   * a app não depende de nenhum serviço externo para funcionar.
   */
  vision: VisionConfig | null
  setLanguage: (language: Language) => void
  setVision: (vision: VisionConfig | null) => void
}

/** A app é em português de Portugal; o inglês é uma escolha explícita nas Definições. */
export const DEFAULT_LANGUAGE: Language = 'pt'

/** Pré-preenchimento do painel de definições: o serviço gratuito recomendado. */
export const DEFAULT_VISION_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
export const DEFAULT_VISION_MODEL = 'gemini-3.5-flash-lite'

/**
 * Configuração de visão embutida na build, vinda de `.env.local`.
 *
 * Serve para não ter de colar a chave à mão em cada dispositivo onde a app é
 * instalada. Devolve `null` quando não há chave — que é o caso normal, já que
 * `.env.local` não vai para o repositório.
 *
 * A chave fica dentro do bundle JavaScript e é legível por quem receba a app.
 * Só faz sentido em builds pessoais.
 */
function visionFromEnv(): VisionConfig | null {
  const apiKey = import.meta.env.VITE_VISION_API_KEY?.trim()
  if (!apiKey) return null
  return {
    apiKey,
    endpoint: import.meta.env.VITE_VISION_ENDPOINT?.trim() || DEFAULT_VISION_ENDPOINT,
    model: import.meta.env.VITE_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL,
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      vision: visionFromEnv(),
      setLanguage: (language) => set({ language }),
      setVision: (vision) => set({ vision }),
    }),
    {
      name: 'settings',
      storage: createPersistStorage(),
      /**
       * O estado guardado ganha ao da build — o que o utilizador configurou no
       * dispositivo manda. A chave embutida só preenche o que está por
       * configurar, incluindo em instalações que já existiam antes de ela ser
       * adicionada.
       */
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<SettingsStore>) }
        return { ...merged, vision: merged.vision ?? visionFromEnv() }
      },
    },
  ),
)

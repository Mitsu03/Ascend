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

export const DEFAULT_VISION_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
export const DEFAULT_VISION_MODEL = 'gpt-4o-mini'

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      vision: null,
      setLanguage: (language) => set({ language }),
      setVision: (vision) => set({ vision }),
    }),
    { name: 'settings', storage: createPersistStorage() },
  ),
)

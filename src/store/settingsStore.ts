import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from '@/services/storage'
import type { Language } from '@/i18n/types'

interface SettingsStore {
  language: Language
  setLanguage: (language: Language) => void
}

/** A app é em português de Portugal; o inglês é uma escolha explícita nas Definições. */
export const DEFAULT_LANGUAGE: Language = 'pt'

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    { name: 'settings', storage: createPersistStorage() },
  ),
)

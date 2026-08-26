import { useMemo } from 'react'
import { en } from '@/i18n/en'
import { pt } from '@/i18n/pt'
import { LOCALE_TAG } from '@/i18n/types'
import { useSettingsStore } from '@/store/settingsStore'
import type { Dictionary } from '@/i18n/pt'
import type { Language, Localized } from '@/i18n/types'

export type { Dictionary } from '@/i18n/pt'
export type { Language, Localized } from '@/i18n/types'
export { LANGUAGES, LANGUAGE_NAMES, LOCALE_TAG, localized } from '@/i18n/types'

const DICTIONARIES: Record<Language, Dictionary> = { pt, en }

export function dictionaryFor(language: Language): Dictionary {
  return DICTIONARIES[language]
}

/** Acesso ao dicionário fora de componentes React (stores, serviços). */
export function getDictionary(): Dictionary {
  return DICTIONARIES[useSettingsStore.getState().language]
}

export function getLanguage(): Language {
  return useSettingsStore.getState().language
}

/** Escolhe a variante correta de um texto de catálogo. */
export function pick(value: Localized, language: Language = getLanguage()): string {
  return value[language]
}

export function formatCount(value: number, language: Language = getLanguage()): string {
  return new Intl.NumberFormat(LOCALE_TAG[language]).format(Math.round(value))
}

export interface I18n {
  lang: Language
  locale: string
  t: Dictionary
  /** Texto de catálogo na língua ativa */
  loc: (value: Localized) => string
  /** Número formatado na língua ativa */
  n: (value: number) => string
}

export function useI18n(): I18n {
  const lang = useSettingsStore((state) => state.language)
  return useMemo(
    () => ({
      lang,
      locale: LOCALE_TAG[lang],
      t: DICTIONARIES[lang],
      loc: (value: Localized) => value[lang],
      n: (value: number) => formatCount(value, lang),
    }),
    [lang],
  )
}

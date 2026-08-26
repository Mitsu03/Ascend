export type Language = 'pt' | 'en'

export const LANGUAGES: Language[] = ['pt', 'en']

/** Texto de conteúdo (catálogos) disponível nas duas línguas. */
export interface Localized {
  pt: string
  en: string
}

export const LOCALE_TAG: Record<Language, string> = {
  pt: 'pt-PT',
  en: 'en-GB',
}

export const LANGUAGE_NAMES: Record<Language, string> = {
  pt: 'Português (Portugal)',
  en: 'English',
}

export function localized(pt: string, en: string): Localized {
  return { pt, en }
}

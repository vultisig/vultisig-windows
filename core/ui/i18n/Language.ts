export const languages = [
  'en',
  'es',
  'pt',
  'it',
  'de',
  'hr',
  'zh',
  'nl',
  'ru',
] as const
export type Language = (typeof languages)[number]

export const primaryLanguage: Language = 'en'

export const languageName: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  hr: 'Hrvatski',
  pt: 'Português',
  zh: '中文',
  nl: 'Nederlands',
  ru: 'Русский',
}

export const languageRegion: Record<Language, string> = {
  en: '(UK)',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  hr: 'Croatian',
  pt: 'Portuguese',
  zh: 'Chinese',
  nl: 'Dutch',
  ru: 'Russian',
}

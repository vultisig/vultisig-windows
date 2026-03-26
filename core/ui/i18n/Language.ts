export const languages = [
  'en',
  'de',
  'es',
  'it',
  'hr',
  'ru',
  'nl',
  'pt',
  'zh',
  'ko',
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
  ko: '한국어',
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
  ko: 'Korean',
}

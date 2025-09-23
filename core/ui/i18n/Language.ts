export const languages = ['en', 'es', 'pt', 'it', 'de', 'hr'] as const
export type Language = (typeof languages)[number]

export const primaryLanguage: Language = 'en'

export const languageName: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  hr: 'Hrvatski',
  pt: 'Português',
}

export const languageRegion: Record<Language, string> = {
  en: 'United Kingdom',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  hr: 'Croatian',
  pt: 'Portuguese',
}

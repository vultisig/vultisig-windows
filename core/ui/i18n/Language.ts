export const languages = ['en', 'es', 'pt', 'it', 'de', 'hr'] as const
export type Language = (typeof languages)[number]

export const primaryLanguage: Language = 'en'

export const languageName: Record<Language, string> = {
  en: 'English',
  de: 'Deutch',
  es: 'Espanol',
  it: 'Italiano',
  hr: 'Hrvatski',
  pt: 'Portuguese',
}

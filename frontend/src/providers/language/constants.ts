export const LANGUAGES = {
  English: 'en',
  German: 'de',
  Spanish: 'es',
  Italian: 'it',
  Croatian: 'hr',
  Portuguese: 'pt',
};

export type LanguageKey = keyof typeof LANGUAGES;
export type LanguageValue = (typeof LANGUAGES)[LanguageKey];

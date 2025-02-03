export const languages = ['en', 'es', 'pt', 'it', 'de', 'hr'] as const;
export type Language = (typeof languages)[number];

export const primaryLanguage: Language = 'en';

import { Language } from '../Language'

type I18nTerminologyRule = {
  sourceTerm: string
  bannedTargetTerms: Partial<Record<Language, string[]>>
  note: string
}

/**
 * Target-language terms that machine translation reaches for but that mean
 * something else in the wallet's domain. Each rule fires only when the English
 * source uses `sourceTerm`, so the same word stays legal where it is correct.
 */
const i18nTerminology: readonly I18nTerminologyRule[] = [
  {
    sourceTerm: 'token',
    bannedTargetTerms: { zh: ['令牌'] },
    note: '令牌 is a security/auth token. A crypto token is 代币, which is what iOS and Android ship.',
  },
]

type TranslationTerminologyIssue = {
  key: string
  locale: string
  kind: 'terminology'
  bannedTerm: string
  note: string
}

type FindTerminologyIssuesInput = {
  key: string
  locale: Language
  source: string
  target: string
}

const usesSourceTerm = ({
  text,
  term,
}: {
  text: string
  term: string
}): boolean => new RegExp(`\\b${term}s?\\b`, 'i').test(text)

/**
 * Reports target strings that translate a domain term with the wrong word.
 * Only inspects a string when its English source carries the term the rule
 * governs, so an unrelated use of the banned word does not trip the check.
 */
export const findTerminologyIssues = ({
  key,
  locale,
  source,
  target,
}: FindTerminologyIssuesInput): TranslationTerminologyIssue[] =>
  i18nTerminology.flatMap(({ sourceTerm, bannedTargetTerms, note }) => {
    if (!usesSourceTerm({ text: source, term: sourceTerm })) {
      return []
    }

    const bannedTerms = bannedTargetTerms[locale] ?? []

    return bannedTerms
      .filter(bannedTerm => target.includes(bannedTerm))
      .map(bannedTerm => ({
        key,
        locale,
        kind: 'terminology' as const,
        bannedTerm,
        note,
      }))
  })

/**
 * Renders a terminology issue as a single reviewer-facing line.
 */
export const formatTerminologyIssue = ({
  key,
  locale,
  bannedTerm,
  note,
}: TranslationTerminologyIssue): string =>
  `[${locale}] ${key}: uses "${bannedTerm}" - ${note}`

type TranslationRecord = {
  readonly [key: string]: string | TranslationRecord
}

type SyntaxCounts = Map<string, number>

type TranslationSyntaxIssue = {
  key: string
  locale: string
  kind: 'interpolation' | 'tag' | 'tag-content'
  missing: string[]
  extra: string[]
}

type TranslationShapeIssue = {
  key: string
  locale: string
  kind: 'missing-key' | 'extra-key' | 'type-mismatch'
}

type TranslationIntegrityIssue = TranslationSyntaxIssue | TranslationShapeIssue

type FlattenedTranslations = Map<string, string>

type DiffCountsInput = {
  source: SyntaxCounts
  target: SyntaxCounts
}

type ExtractMatchesInput = {
  text: string
  pattern: RegExp
}

type FlattenTranslationsInput = {
  record: TranslationRecord
  locale: string
  prefix?: string
}

const interpolationTokenPattern = /{{\s*([^{}]+?)\s*}}/g
const i18nMarkupPattern = /<\/?\s*([A-Za-z][A-Za-z0-9]*)\b[^>]*?>/g
const tagContentPattern = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/g
const protectedSyntaxPattern = /{{\s*[^{}]+?\s*}}/g

const toCounts = (values: string[]): SyntaxCounts => {
  const result: SyntaxCounts = new Map()

  values.forEach(value => {
    result.set(value, (result.get(value) ?? 0) + 1)
  })

  return result
}

const diffCounts = ({ source, target }: DiffCountsInput): string[] => {
  const result: string[] = []

  source.forEach((count, value) => {
    const targetCount = target.get(value) ?? 0
    const missingCount = count - targetCount

    for (let index = 0; index < missingCount; index++) {
      result.push(value)
    }
  })

  return result
}

const extractMatches = ({ text, pattern }: ExtractMatchesInput): string[] => {
  const result: string[] = []

  for (const match of text.matchAll(pattern)) {
    const value = match[1]

    if (value) {
      result.push(value.trim())
    }
  }

  return result
}

const extractTagMarkers = (text: string): string[] => {
  const result: string[] = []

  for (const match of text.matchAll(i18nMarkupPattern)) {
    const rawTag = match[0]
    const tagName = match[1]

    if (!tagName) {
      continue
    }

    const isClosingTag = /^<\s*\//.test(rawTag)
    const isSelfClosingTag = /\/\s*>$/.test(rawTag)
    const prefix = isClosingTag ? '/' : ''
    const suffix = isSelfClosingTag ? '/' : ''

    result.push(`${prefix}${tagName}${suffix}`)
  }

  return result
}

const extractNonEmptyTagContentMarkers = (text: string): string[] => {
  const result: string[] = []

  for (const match of text.matchAll(tagContentPattern)) {
    const tagName = match[1]
    const content = match[2]

    if (tagName && content?.trim()) {
      result.push(tagName)
    }
  }

  return result
}

const compareSyntax = ({
  key,
  locale,
  kind,
  sourceValues,
  targetValues,
}: {
  key: string
  locale: string
  kind: TranslationSyntaxIssue['kind']
  sourceValues: string[]
  targetValues: string[]
}): TranslationSyntaxIssue | undefined => {
  const sourceCounts = toCounts(sourceValues)
  const targetCounts = toCounts(targetValues)
  const missing = diffCounts({ source: sourceCounts, target: targetCounts })
  const extra = diffCounts({ source: targetCounts, target: sourceCounts })

  if (missing.length === 0 && extra.length === 0) {
    return undefined
  }

  return {
    key,
    locale,
    kind,
    missing,
    extra,
  }
}

const flattenTranslations = ({
  record,
  locale,
  prefix = '',
}: FlattenTranslationsInput): {
  values: FlattenedTranslations
  shapeIssues: TranslationShapeIssue[]
} => {
  const values: FlattenedTranslations = new Map()
  const shapeIssues: TranslationShapeIssue[] = []

  Object.entries(record).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      values.set(fullKey, value)
      return
    }

    if (typeof value === 'object' && value !== null) {
      const nested = flattenTranslations({
        record: value,
        locale,
        prefix: fullKey,
      })

      nested.values.forEach((nestedValue, nestedKey) => {
        values.set(nestedKey, nestedValue)
      })
      shapeIssues.push(...nested.shapeIssues)
      return
    }

    shapeIssues.push({ key: fullKey, locale, kind: 'type-mismatch' })
  })

  return { values, shapeIssues }
}

/**
 * Compares one translated string against its source for preserved i18n syntax.
 */
export const findI18nSyntaxIssues = ({
  key,
  locale,
  source,
  target,
}: {
  key: string
  locale: string
  source: string
  target: string
}): TranslationSyntaxIssue[] => {
  const issues = [
    compareSyntax({
      key,
      locale,
      kind: 'interpolation',
      sourceValues: extractMatches({
        text: source,
        pattern: interpolationTokenPattern,
      }),
      targetValues: extractMatches({
        text: target,
        pattern: interpolationTokenPattern,
      }),
    }),
    compareSyntax({
      key,
      locale,
      kind: 'tag',
      sourceValues: extractTagMarkers(source),
      targetValues: extractTagMarkers(target),
    }),
    compareSyntax({
      key,
      locale,
      kind: 'tag-content',
      sourceValues: extractNonEmptyTagContentMarkers(source),
      targetValues: extractNonEmptyTagContentMarkers(target),
    }),
  ]

  return issues.filter(issue => issue !== undefined)
}

/**
 * Compares a full locale record against the source locale.
 */
export const findTranslationIntegrityIssues = ({
  source,
  target,
  locale,
}: {
  source: TranslationRecord
  target: TranslationRecord
  locale: string
}): TranslationIntegrityIssue[] => {
  const sourceEntries = flattenTranslations({ record: source, locale })
  const targetEntries = flattenTranslations({ record: target, locale })
  const issues: TranslationIntegrityIssue[] = [
    ...sourceEntries.shapeIssues,
    ...targetEntries.shapeIssues,
  ]

  sourceEntries.values.forEach((sourceValue, key) => {
    const targetValue = targetEntries.values.get(key)

    if (targetValue === undefined) {
      issues.push({ key, locale, kind: 'missing-key' })
      return
    }

    issues.push(
      ...findI18nSyntaxIssues({
        key,
        locale,
        source: sourceValue,
        target: targetValue,
      })
    )
  })

  targetEntries.values.forEach((_, key) => {
    if (!sourceEntries.values.has(key)) {
      issues.push({ key, locale, kind: 'extra-key' })
    }
  })

  return issues
}

/**
 * Replaces interpolation placeholders with stable sentinels before translation.
 */
export const protectInterpolationTokens = (text: string) => {
  const syntaxTokens: string[] = []
  const protectedText = text.replace(protectedSyntaxPattern, value => {
    const tokenIndex = syntaxTokens.length

    syntaxTokens.push(value)

    return `X_I18N_TOKEN_${tokenIndex}_X`
  })

  const restore = (translatedText: string): string => {
    const restoreToken = (tokenIndex: string, fallback: string) => {
      const syntaxToken = syntaxTokens[Number(tokenIndex)]

      return syntaxToken ?? fallback
    }

    return translatedText
      .replace(
        /<span\b[^>]*>\s*X_I18N_TOKEN_(\d+)_X\s*<\/span>/g,
        (match, tokenIndex: string) => restoreToken(tokenIndex, match)
      )
      .replace(/X_I18N_TOKEN_(\d+)_X/g, (match, tokenIndex: string) =>
        restoreToken(tokenIndex, match)
      )
  }

  return { text: protectedText, restore }
}

const isTranslationSyntaxIssue = (
  issue: TranslationIntegrityIssue
): issue is TranslationSyntaxIssue =>
  issue.kind === 'interpolation' ||
  issue.kind === 'tag' ||
  issue.kind === 'tag-content'

/**
 * Formats an integrity issue for CLI output and translation errors.
 */
export const formatTranslationIntegrityIssue = (
  issue: TranslationIntegrityIssue
): string => {
  if (!isTranslationSyntaxIssue(issue)) {
    return `${issue.locale}.${issue.key}: ${issue.kind}`
  }

  const parts = [
    issue.missing.length > 0
      ? `missing [${issue.missing.join(', ')}]`
      : undefined,
    issue.extra.length > 0 ? `extra [${issue.extra.join(', ')}]` : undefined,
  ].filter(part => part !== undefined)

  return `${issue.locale}.${issue.key}: ${issue.kind} mismatch (${parts.join('; ')})`
}

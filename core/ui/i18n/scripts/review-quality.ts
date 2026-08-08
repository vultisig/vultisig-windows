import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Language, languages, primaryLanguage } from '../Language'
import { i18nGlossary } from '../utils/i18nGlossary'
import {
  flattenTranslationRecord,
  readTranslationRecordFromSource,
} from '../utils/translationRecords'

type ReviewItem = {
  key: string
  locale: Language
  source: string
  target: string | undefined
  previousSource: string | undefined
  previousTarget: string | undefined
  reasons: string[]
  blocksStrict: boolean
  safetyCritical: boolean
}

type ReadLocaleInput = {
  language: Language
  source: string
  fileName: string
}

type ReadGitFileInput = {
  ref: string
  filePath: string
}

type GetReviewItemsInput = {
  baseRef: string
  includeAll: boolean
}

const currentDirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(currentDirname, '../../../..')
const localeDirectory = 'core/ui/i18n/locales'

const safetyCriticalPattern =
  /backup|password|recover|recovery|funds?|signing?|seed phrase|seedphrase|vault share|delete|irreversible|claim/i
const polarityPattern =
  /\b(cannot|can't|can not|do not|don't|never|not|no|without|irreversible|forget|forgot|lost|loss)\b/i
const markupPattern = /<\/?[A-Za-z][A-Za-z0-9]*\b[^>]*?>/

const getArgValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(name)

  if (index < 0) {
    return undefined
  }

  return process.argv[index + 1]
}

const runGit = (args: string[]): string | undefined => {
  try {
    return execFileSync('git', args, {
      cwd: workspaceRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return undefined
  }
}

const getDefaultBaseRef = (): string => {
  const localeStatus = runGit(['status', '--porcelain', '--', localeDirectory])

  if (localeStatus) {
    return 'HEAD'
  }

  const mergeBase = runGit(['merge-base', 'HEAD', 'origin/main'])
  const head = runGit(['rev-parse', 'HEAD'])

  if (mergeBase && head && mergeBase !== head) {
    return mergeBase
  }

  return 'HEAD'
}

const getLocaleFilePath = (language: Language): string =>
  `${localeDirectory}/${language}.ts`

const readGitFile = ({
  ref,
  filePath,
}: ReadGitFileInput): string | undefined => {
  try {
    return execFileSync('git', ['show', `${ref}:${filePath}`], {
      cwd: workspaceRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return undefined
  }
}

const readLocale = ({ language, source, fileName }: ReadLocaleInput) =>
  flattenTranslationRecord({
    record: readTranslationRecordFromSource({
      source,
      exportName: language,
      fileName,
    }),
  })

const readCurrentLocale = (language: Language): Map<string, string> => {
  const filePath = getLocaleFilePath(language)
  const source = fs.readFileSync(path.resolve(workspaceRoot, filePath), 'utf8')

  return readLocale({ language, source, fileName: filePath })
}

const readBaseLocale = ({
  language,
  baseRef,
}: {
  language: Language
  baseRef: string
}): Map<string, string> => {
  const filePath = getLocaleFilePath(language)
  const source = readGitFile({ ref: baseRef, filePath })

  if (!source) {
    return new Map()
  }

  return readLocale({ language, source, fileName: `${baseRef}:${filePath}` })
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const includesGlossaryTerm = (text: string, term: string): boolean => {
  const pattern = new RegExp(
    `(^|[^A-Za-z0-9_$])${escapeRegExp(term)}(?=$|[^A-Za-z0-9_])`
  )

  return pattern.test(text)
}

const getGlossaryReasons = ({
  source,
  target,
}: {
  source: string
  target: string | undefined
}): {
  reasons: string[]
  blocksStrict: boolean
} => {
  const reasons: string[] = []
  let blocksStrict = false

  i18nGlossary.forEach(({ term, preserve, note, targetTerms = [term] }) => {
    if (!includesGlossaryTerm(source, term)) {
      return
    }

    if (preserve) {
      if (
        !target ||
        !targetTerms.some(targetTerm =>
          includesGlossaryTerm(target, targetTerm)
        )
      ) {
        reasons.push(`Preserved glossary term missing: "${term}" - ${note}`)
        blocksStrict = true
        return
      }

      reasons.push(`Preserved glossary term present: "${term}" - ${note}`)
      return
    }

    reasons.push(`Review glossary term "${term}" - ${note}`)
  })

  return { reasons, blocksStrict }
}

const getReviewItems = ({
  baseRef,
  includeAll,
}: GetReviewItemsInput): ReviewItem[] => {
  const currentSource = readCurrentLocale(primaryLanguage)
  const previousSource = readBaseLocale({
    language: primaryLanguage,
    baseRef,
  })

  return languages.flatMap(language => {
    if (language === primaryLanguage) {
      return []
    }

    const currentTarget = readCurrentLocale(language)
    const previousTarget = readBaseLocale({ language, baseRef })
    const keys = new Set(currentSource.keys())

    return Array.from(keys).flatMap(key => {
      const source = currentSource.get(key)

      if (source === undefined) {
        return []
      }

      const target = currentTarget.get(key)
      const oldSource = previousSource.get(key)
      const oldTarget = previousTarget.get(key)
      const sourceChanged = oldSource !== undefined && oldSource !== source
      const sourceAdded = oldSource === undefined
      const targetChanged = oldTarget !== target
      const shouldReview =
        includeAll || sourceChanged || sourceAdded || targetChanged

      if (!shouldReview) {
        return []
      }

      const reasons: string[] = []
      let blocksStrict = false
      const safetyCritical = safetyCriticalPattern.test(`${key} ${source}`)

      if (sourceAdded) {
        reasons.push('New English source string.')
      } else if (sourceChanged) {
        reasons.push('English source changed.')
      }

      if (targetChanged) {
        reasons.push('Generated locale string changed.')
      }

      if (sourceChanged && oldTarget !== undefined && oldTarget === target) {
        reasons.push(
          'Target is unchanged even though English changed; run translate or justify manually.'
        )
        blocksStrict = true
      }

      if (target === undefined) {
        reasons.push('Target locale is missing this key.')
        blocksStrict = true
      }

      if (safetyCritical) {
        reasons.push(
          'Safety-critical copy: check backup/password/recovery/signing/funds meaning.'
        )
      }

      if (polarityPattern.test(source)) {
        reasons.push(
          'Polarity-sensitive copy: verify cannot/not/never meaning.'
        )
      }

      if (markupPattern.test(source)) {
        reasons.push(
          'Inline markup present: verify words around tags are fluent.'
        )
      }

      const glossary = getGlossaryReasons({ source, target })
      reasons.push(...glossary.reasons)
      blocksStrict = blocksStrict || glossary.blocksStrict

      return [
        {
          key,
          locale: language,
          source,
          target,
          previousSource: oldSource,
          previousTarget: oldTarget,
          reasons,
          blocksStrict,
          safetyCritical,
        },
      ]
    })
  })
}

const formatText = (value: string | undefined): string =>
  value === undefined ? '_missing_' : value.replace(/\n/g, '\\n')

const formatItem = (item: ReviewItem): string => {
  const lines = [
    `### ${item.locale}.${item.key}`,
    '',
    `- English: ${formatText(item.source)}`,
    `- ${item.locale}: ${formatText(item.target)}`,
  ]

  if (
    item.previousSource !== undefined &&
    item.previousSource !== item.source
  ) {
    lines.push(`- Previous English: ${formatText(item.previousSource)}`)
  }

  if (
    item.previousTarget !== undefined &&
    item.previousTarget !== item.target
  ) {
    lines.push(`- Previous ${item.locale}: ${formatText(item.previousTarget)}`)
  }

  lines.push('- Review notes:')
  item.reasons.forEach(reason => {
    lines.push(`  - ${reason}`)
  })

  return lines.join('\n')
}

const includeAll = process.argv.includes('--all')
const strict = process.argv.includes('--strict')
const baseRef = getArgValue('--base') ?? getDefaultBaseRef()
const items = getReviewItems({ baseRef, includeAll })
const safetyItems = items.filter(({ safetyCritical }) => safetyCritical)
const otherItems = items.filter(({ safetyCritical }) => !safetyCritical)
const strictBlockers = items.filter(({ blocksStrict }) => blocksStrict)

if (items.length === 0) {
  console.log(
    `No changed translation entries need quality review against ${baseRef}.`
  )
  process.exit(0)
}

console.log(`# I18n Translation Quality Review\n`)
console.log(`Base: ${baseRef}`)
console.log(`Entries to review: ${items.length}`)
console.log(`Safety-critical entries: ${safetyItems.length}`)
console.log(`Strict blockers: ${strictBlockers.length}\n`)

if (safetyItems.length > 0) {
  console.log('## Safety-Critical\n')
  console.log(safetyItems.map(formatItem).join('\n\n'))
  console.log('')
}

if (otherItems.length > 0) {
  console.log('## Domain And General Copy\n')
  console.log(otherItems.map(formatItem).join('\n\n'))
}

if (strict && strictBlockers.length > 0) {
  process.exitCode = 1
}

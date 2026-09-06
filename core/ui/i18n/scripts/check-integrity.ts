import { languages, primaryLanguage } from '../Language'
import { translations } from '../translations'
import {
  findTranslationIntegrityIssues,
  formatTranslationIntegrityIssue,
} from '../utils/i18nSyntax'
import {
  findTerminologyIssues,
  formatTerminologyIssue,
} from '../utils/i18nTerminology'
import { flattenTranslationRecord } from '../utils/translationRecords'

const source = translations[primaryLanguage]
const flatSource = flattenTranslationRecord({ record: source })

const issues = languages.flatMap(language => {
  if (language === primaryLanguage) {
    return []
  }

  return findTranslationIntegrityIssues({
    source,
    target: translations[language],
    locale: language,
  })
})

const terminologyIssues = languages.flatMap(language => {
  if (language === primaryLanguage) {
    return []
  }

  return [
    ...flattenTranslationRecord({ record: translations[language] }),
  ].flatMap(([key, target]) => {
    const sourceText = flatSource.get(key)

    if (sourceText === undefined) {
      return []
    }

    return findTerminologyIssues({
      key,
      locale: language,
      source: sourceText,
      target,
    })
  })
})

if (issues.length === 0 && terminologyIssues.length === 0) {
  console.log('i18n integrity check passed')
  process.exit(0)
}

const total = issues.length + terminologyIssues.length
console.log(`i18n integrity check failed with ${total} issue(s):`)
issues.forEach(issue => {
  console.log(`  - ${formatTranslationIntegrityIssue(issue)}`)
})
terminologyIssues.forEach(issue => {
  console.log(`  - ${formatTerminologyIssue(issue)}`)
})

process.exit(1)

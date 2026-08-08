import { languages, primaryLanguage } from '../Language'
import { translations } from '../translations'
import {
  findTranslationIntegrityIssues,
  formatTranslationIntegrityIssue,
} from '../utils/i18nSyntax'

const source = translations[primaryLanguage]
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

if (issues.length === 0) {
  console.log('i18n integrity check passed')
  process.exit(0)
}

console.log(`i18n integrity check failed with ${issues.length} issue(s):`)
issues.forEach(issue => {
  console.log(`  - ${formatTranslationIntegrityIssue(issue)}`)
})

process.exit(1)

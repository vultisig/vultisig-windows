import { primaryLanguage } from '../Language'
import { translations } from '../translations'
import { flattenTranslationRecord } from '../utils/translationRecords'

const sourceTranslations = flattenTranslationRecord({
  record: translations[primaryLanguage],
})
const valueToKeys = new Map<string, string[]>()

sourceTranslations.forEach((value, key) => {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return
  }

  valueToKeys.set(normalizedValue, [
    ...(valueToKeys.get(normalizedValue) ?? []),
    key,
  ])
})

const duplicates = Array.from(valueToKeys.entries())
  .filter(([, keys]) => keys.length > 1)
  .sort((first, second) => {
    const countDelta = second[1].length - first[1].length

    if (countDelta !== 0) {
      return countDelta
    }

    return first[0].localeCompare(second[0])
  })

if (duplicates.length === 0) {
  console.log('No duplicate English translation values found.')
  process.exit(0)
}

console.log('Duplicate English translation values:')
console.log('')

duplicates.forEach(([value, keys]) => {
  console.log(`Value: "${value.replace(/\n/g, '\\n')}"`)
  console.log(`Keys (${keys.length}):`)
  keys.forEach(key => console.log(`  - ${key}`))
  console.log('')
})

console.log(
  `Found ${duplicates.length} duplicate value group(s). This command is advisory; repeated labels can be intentional.`
)

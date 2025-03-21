import { en } from '../locales/en'

/**
 * Flattens a nested object into a single-level object with dot notation keys
 */
function flattenObject(
  obj: Record<string, any>,
  prefix = ''
): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, key: string) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey))
    } else {
      acc[prefixedKey] = obj[key]
    }

    return acc
  }, {})
}

/**
 * Finds duplicate text values in the English translations
 */
function findDuplicateTexts() {
  const translationObj = en
  const flattenedTranslations = flattenObject(translationObj)

  // Create a map of values to arrays of keys
  const valueToKeysMap: Record<string, string[]> = {}

  // Group keys by their values
  Object.entries(flattenedTranslations).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim() !== '') {
      if (!valueToKeysMap[value]) {
        valueToKeysMap[value] = []
      }
      valueToKeysMap[value].push(key)
    }
  })

  // Filter out values that have only one key
  const duplicates = Object.entries(valueToKeysMap)
    .filter(([_value, keys]) => keys.length > 1)
    .sort((a, b) => b[1].length - a[1].length) // Sort by number of duplicates (descending)

  return duplicates
}

// Find duplicates only in English translations
const duplicates = findDuplicateTexts()

if (duplicates.length > 0) {
  console.log('\nDuplicate texts in English translations:')
  console.log('----------------------------------------')

  duplicates.forEach(([value, keys]) => {
    console.log(`Value: '${value}'`)
    console.log(`Keys (${keys.length}):\n  - ${keys.join('\n  - ')}`)
    console.log('----------------------------------------')
  })

  console.log(`Total: ${duplicates.length} duplicate values found`)
} else {
  console.log('\nNo duplicates found in English translations')
}

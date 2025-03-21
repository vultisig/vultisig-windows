import { createTsFile } from '@lib/codegen/utils/createTsFile'
import { without } from '@lib/utils/array/without'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { Copy } from '../Copy'
import { Language, languages, primaryLanguage } from '../Language'
import { translations } from '../translations'
import { translateTexts } from '../utils/translateTexts'

const copyDirectory = '../locales'

const currentDirname = dirname(fileURLToPath(import.meta.url))

/**
 * Recursively processes translation objects, finding and translating missing keys
 * while preserving the nested structure.
 */
const processTranslations = async (
  sourceCopy: Copy,
  targetCopy: Copy,
  fromLang: Language,
  toLang: Language
): Promise<Copy> => {
  const result: Copy = { ...targetCopy }
  const missingKeys: string[] = []
  const missingTexts: string[] = []
  const missingPaths: { key: string; path: string[] }[] = []

  // Recursive function to traverse the nested structure
  const traverse = (
    source: Copy,
    target: Copy,
    currentPath: string[] = []
  ): void => {
    // Remove keys from target that don't exist in source
    Object.keys(target).forEach(key => {
      if (!(key in source)) {
        delete target[key]
      }
    })

    // Find missing or untranslated keys
    Object.entries(source).forEach(([key, value]) => {
      if (!(key in target)) {
        if (typeof value === 'string') {
          missingKeys.push(key)
          missingTexts.push(value)
          missingPaths.push({ key, path: currentPath })
        } else if (typeof value === 'object') {
          target[key] = {}
          traverse(value as Copy, target[key] as Copy, [...currentPath, key])
        }
      } else if (typeof value === 'object' && typeof target[key] === 'object') {
        // Recursive traversal for nested objects
        traverse(value as Copy, target[key] as Copy, [...currentPath, key])
      }
    })
  }

  traverse(sourceCopy, result)

  // Translate missing texts if any
  if (missingTexts.length > 0) {
    console.log(
      `Found ${missingTexts.length} missing translations for ${toLang}`
    )
    const translatedTexts = await translateTexts({
      texts: missingTexts,
      from: fromLang,
      to: toLang,
    })

    // Add translated texts back to the result at their correct paths
    missingPaths.forEach((item, index) => {
      let current = result

      // Navigate to the correct nested position
      for (const pathPart of item.path) {
        if (!current[pathPart]) {
          current[pathPart] = {}
        }
        current = current[pathPart] as Copy
      }

      // Add the translated text
      current[item.key] = translatedTexts[index]
    })
  }

  return result
}

const sync = async () => {
  const sourceCopy = translations[primaryLanguage]

  await Promise.all(
    without(languages, primaryLanguage).map(async language => {
      const oldCopy = translations[language]

      // Process translations recursively
      const result = await processTranslations(
        sourceCopy,
        oldCopy,
        primaryLanguage,
        language
      )

      const content = `export const ${language} = ${JSON.stringify(result, null, 2)}`

      createTsFile({
        directory: path.resolve(currentDirname, copyDirectory),
        fileName: language,
        content,
      })
    })
  )
}

sync()

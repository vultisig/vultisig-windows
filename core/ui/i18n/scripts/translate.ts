import fs from 'node:fs'
import path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createTsFile } from '@lib/codegen/utils/createTsFile'
import { without } from '@lib/utils/array/without'

import { Language, languages, primaryLanguage } from '../Language'
import { translations } from '../translations'
import { translateTexts } from '../utils/translateTexts'

type RecursiveRecord = {
  [key: string]: string | RecursiveRecord
}

const copyDirectory = '../locales'

const currentDirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(currentDirname, '../../../..')

const processTranslations = async (
  sourceCopy: RecursiveRecord,
  targetCopy: RecursiveRecord,
  fromLang: Language,
  toLang: Language
): Promise<RecursiveRecord> => {
  const result: RecursiveRecord = { ...targetCopy }
  const missingKeys: string[] = []
  const missingTexts: string[] = []
  const missingPaths: { key: string; path: string[] }[] = []

  const traverse = (
    source: RecursiveRecord,
    target: RecursiveRecord,
    currentPath: string[] = []
  ): void => {
    Object.keys(target).forEach(key => {
      if (!(key in source)) {
        delete target[key]
      }
    })

    Object.entries(source).forEach(([key, value]) => {
      if (!(key in target)) {
        if (typeof value === 'string') {
          missingKeys.push(key)
          missingTexts.push(value)
          missingPaths.push({ key, path: currentPath })
        } else if (typeof value === 'object') {
          target[key] = {}
          traverse(value as RecursiveRecord, target[key] as RecursiveRecord, [
            ...currentPath,
            key,
          ])
        }
      } else if (typeof value === 'object' && typeof target[key] === 'object') {
        traverse(value as RecursiveRecord, target[key] as RecursiveRecord, [
          ...currentPath,
          key,
        ])
      }
    })
  }

  traverse(sourceCopy, result)

  if (missingTexts.length > 0) {
    console.log(
      `Found ${missingTexts.length} missing translations for ${toLang}`
    )
    const translatedTexts = await translateTexts({
      texts: missingTexts,
      from: fromLang,
      to: toLang,
    })

    missingPaths.forEach((item, index) => {
      let current = result

      for (const pathPart of item.path) {
        if (!current[pathPart]) {
          current[pathPart] = {}
        }
        current = current[pathPart] as RecursiveRecord
      }

      current[item.key] = translatedTexts[index]
    })
  }

  return result
}

const sync = async () => {
  if (!process.env.GOOGLE_TRANSLATE_PROJECT_ID) {
    console.log(
      'i18n:sync skipped — GOOGLE_TRANSLATE_PROJECT_ID env var is not set'
    )
    return
  }

  const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialsEnv) {
    console.log(
      'i18n:sync skipped — GOOGLE_APPLICATION_CREDENTIALS env var is not set'
    )
    return
  }

  const credentialsPath = path.isAbsolute(credentialsEnv)
    ? credentialsEnv
    : path.resolve(workspaceRoot, credentialsEnv)

  if (!fs.existsSync(credentialsPath)) {
    console.log(
      `i18n:sync skipped — credentials file not found at ${credentialsPath}`
    )
    return
  }

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath

  const sourceCopy = translations[primaryLanguage]

  await Promise.all(
    without(languages, primaryLanguage).map(async language => {
      const oldCopy = translations[language]
      const oldSerialized = JSON.stringify(oldCopy, null, 2)

      const result = await processTranslations(
        sourceCopy,
        oldCopy,
        primaryLanguage,
        language
      )

      const newSerialized = JSON.stringify(result, null, 2)

      if (oldSerialized === newSerialized) {
        return
      }

      console.log(`Synced ${language} translations`)

      const content = `export const ${language} = ${newSerialized}`

      await createTsFile({
        directory: path.resolve(currentDirname, copyDirectory),
        fileName: language,
        content,
      })
    })
  )
}

sync().catch(error => {
  console.log(`i18n:sync failed (non-blocking): ${error.message}`)
})

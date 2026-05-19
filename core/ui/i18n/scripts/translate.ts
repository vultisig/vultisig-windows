import fs from 'node:fs'
import path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createTsFile } from '@lib/codegen/utils/createTsFile'
import { without } from '@vultisig/lib-utils/array/without'

import { Language, languages, primaryLanguage } from '../Language'
import { translations } from '../translations'
import { findI18nSyntaxIssues } from '../utils/i18nSyntax'
import { translateTexts } from '../utils/translateTexts'

type RecursiveRecord = {
  [key: string]: string | RecursiveRecord
}

const copyDirectory = '../locales'

const currentDirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(currentDirname, '../../../..')

const isRecursiveRecord = (value: unknown): value is RecursiveRecord =>
  typeof value === 'object' && value !== null

const processTranslations = async (
  sourceCopy: RecursiveRecord,
  targetCopy: RecursiveRecord,
  fromLang: Language,
  toLang: Language
): Promise<RecursiveRecord> => {
  const result: RecursiveRecord = { ...targetCopy }
  const pendingTexts: string[] = []
  const pendingPaths: { key: string; path: string[] }[] = []

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
      const targetValue = target[key]

      if (typeof value === 'string') {
        if (
          typeof targetValue !== 'string' ||
          findI18nSyntaxIssues({
            key: [...currentPath, key].join('.'),
            locale: toLang,
            source: value,
            target: targetValue,
          }).length > 0
        ) {
          pendingTexts.push(value)
          pendingPaths.push({ key, path: currentPath })
        }

        return
      }

      if (!isRecursiveRecord(targetValue)) {
        target[key] = {}
      }

      const nestedTarget = target[key]

      if (isRecursiveRecord(nestedTarget)) {
        traverse(value, nestedTarget, [...currentPath, key])
      }
    })
  }

  traverse(sourceCopy, result)

  if (pendingTexts.length > 0) {
    console.log(
      `Found ${pendingTexts.length} missing or invalid translations for ${toLang}`
    )
    const translatedTexts = await translateTexts({
      texts: pendingTexts,
      from: fromLang,
      to: toLang,
    })

    pendingPaths.forEach((item, index) => {
      let current = result

      for (const pathPart of item.path) {
        if (!isRecursiveRecord(current[pathPart])) {
          current[pathPart] = {}
        }

        const next = current[pathPart]

        if (isRecursiveRecord(next)) {
          current = next
        }
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
  console.log(`i18n:sync failed: ${error.message}`)
  process.exitCode = 1
})

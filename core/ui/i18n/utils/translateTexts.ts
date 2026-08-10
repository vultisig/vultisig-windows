import { TranslationServiceClient } from '@google-cloud/translate'
import { toBatches } from '@vultisig/lib-utils/array/toBatches'

import { Language } from '../Language'
import {
  findI18nSyntaxIssues,
  formatTranslationIntegrityIssue,
  protectInterpolationTokens,
} from './i18nSyntax'

const batchSize = 600

const namedHtmlEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

const htmlEntityPattern = /&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z]+);/g

/**
 * Undoes the entity escaping the translation API applies because we request
 * `text/html` — a mime type we need so the `<tag>` markup of `Trans` strings
 * survives the round trip. Left encoded, an apostrophe comes back as the
 * literal `&#39;` and reaches users that way, which is how Romance-language
 * copy in this repo ended up full of them.
 */
const decodeHtmlEntities = (value: string): string =>
  value.replace(htmlEntityPattern, (match, entity: string) => {
    if (!entity.startsWith('#')) {
      return namedHtmlEntities[entity.toLowerCase()] ?? match
    }

    const isHex = entity[1] === 'x' || entity[1] === 'X'
    const codePoint = Number.parseInt(
      isHex ? entity.slice(2) : entity.slice(1),
      isHex ? 16 : 10
    )

    return Number.isSafeInteger(codePoint) && codePoint > 0
      ? String.fromCodePoint(codePoint)
      : match
  })

type TranslateTextsParams = {
  texts: string[]
  from: Language
  to: Language
}

export const translateTexts = async ({
  texts,
  from,
  to,
}: TranslateTextsParams): Promise<string[]> => {
  console.log(`Translating ${texts.length} texts from ${from} to ${to}`)
  if (texts.length === 0) {
    return []
  }

  const translationClient = new TranslationServiceClient()

  const batches = toBatches(texts, batchSize)

  const result = []
  for (const contents of batches) {
    const protectedContents = contents.map(protectInterpolationTokens)
    const request = {
      parent: `projects/${process.env.GOOGLE_TRANSLATE_PROJECT_ID}/locations/global`,
      contents: protectedContents.map(({ text }) => text),
      mimeType: 'text/html',
      sourceLanguageCode: from,
      targetLanguageCode: to,
    }

    const [{ translations }] = await translationClient.translateText(request)
    if (!translations) {
      throw new Error('No translations')
    }

    if (translations.length !== contents.length) {
      throw new Error(
        `Expected ${contents.length} translations, received ${translations.length}`
      )
    }

    result.push(
      ...translations.map((translation, index) => {
        let { translatedText } = translation
        if (!translatedText) {
          throw new Error('No translatedText')
        }

        translatedText = decodeHtmlEntities(
          protectedContents[index].restore(translatedText)
        )

        const syntaxIssues = findI18nSyntaxIssues({
          key: `batch item ${index + 1}`,
          locale: to,
          source: contents[index],
          target: translatedText,
        })

        if (syntaxIssues.length > 0) {
          throw new Error(
            [
              'Translation changed i18n syntax:',
              ...syntaxIssues.map(formatTranslationIntegrityIssue),
            ].join('\n')
          )
        }

        if (contents[index].endsWith('?') && !translatedText.endsWith('?')) {
          translatedText += '?'
        }

        return translatedText
      })
    )
  }

  return result
}

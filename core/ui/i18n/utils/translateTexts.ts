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
  // Escaped, not a literal: this is U+00A0, which is invisible in source and
  // reads as a plain space. Decoding recovers the character the entity names,
  // and languages that space their punctuation rely on it not breaking lines.
  nbsp: '\u00a0',
  quot: '"',
}

const htmlEntityPattern = /&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z]+);/g

const maxCodePoint = 0x10ffff
const firstSurrogate = 0xd800
const lastSurrogate = 0xdfff

/**
 * Whether a numeric entity names a character `String.fromCodePoint` will accept
 * and that is worth putting in a locale file. Anything above the Unicode range
 * makes it throw, which would abort a whole translation batch over one
 * malformed entity; lone surrogates are legal there but decode to an unpaired
 * half that has no business in shipped copy.
 */
const isDecodableCodePoint = (codePoint: number): boolean =>
  Number.isInteger(codePoint) &&
  codePoint > 0 &&
  codePoint <= maxCodePoint &&
  !(codePoint >= firstSurrogate && codePoint <= lastSurrogate)

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

    return isDecodableCodePoint(codePoint)
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

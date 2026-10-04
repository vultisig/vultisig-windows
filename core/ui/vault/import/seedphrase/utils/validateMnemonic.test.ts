import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { createInstance } from 'i18next'
import { beforeAll, describe, expect, it } from 'vitest'

import { validateMnemonic } from './validateMnemonic'

// A real i18next instance with no resources: t(key) returns the key verbatim,
// giving an identity translator with a genuine TFunction type (no casts), so
// each result names the error it reports.
const i18n = createInstance()
void i18n.init({ lng: 'en', resources: {} })
const t = i18n.t

const repeatWord = (count: number) => Array(count).fill('abandon').join(' ')

describe('validateMnemonic', () => {
  let walletCore: WalletCore

  beforeAll(async () => {
    walletCore = await initWasm()
  })

  // All-zero entropy at every BIP39 length; the 18-word one is the official BIP39 test vector
  it.each([
    [12, `${'abandon '.repeat(11)}about`],
    [15, `${'abandon '.repeat(14)}address`],
    [18, `${'abandon '.repeat(17)}agent`],
    [21, `${'abandon '.repeat(20)}admit`],
    [24, `${'abandon '.repeat(23)}art`],
  ])('accepts a valid %i-word mnemonic', (_wordCount, mnemonic) => {
    expect(validateMnemonic({ mnemonic, walletCore, t })).toBeNull()
  })

  it.each([11, 13, 16, 23, 25])(
    'rejects %i words with the word count error',
    wordCount => {
      expect(
        validateMnemonic({ mnemonic: repeatWord(wordCount), walletCore, t })
      ).toBe('seedphrase_word_count_error')
    }
  )

  it('rejects a supported length whose checksum is wrong', () => {
    expect(validateMnemonic({ mnemonic: repeatWord(18), walletCore, t })).toBe(
      'seedphrase_invalid_error'
    )
  })

  it('reports nothing for empty input', () => {
    expect(validateMnemonic({ mnemonic: '  ', walletCore, t })).toBeNull()
  })
})

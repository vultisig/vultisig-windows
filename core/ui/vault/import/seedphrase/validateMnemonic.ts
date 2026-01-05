import { isOneOf } from '@lib/utils/array/isOneOf'
import { WalletCore } from '@trustwallet/wallet-core'
import { TFunction } from 'i18next'

import { seedphraseWordCounts } from './config'

type ValidateMnemonicInput = {
  mnemonic: string
  walletCore: WalletCore
  t: TFunction
}

export const cleanMnemonic = (text: string) =>
  text.split(/\s+/).filter(Boolean).join(' ')

export const validateMnemonic = ({
  mnemonic,
  walletCore,
  t,
}: ValidateMnemonicInput): string | null => {
  const cleaned = cleanMnemonic(mnemonic)

  if (cleaned === '') {
    return null
  }

  const words = cleaned.split(' ')
  const count = words.length

  if (!isOneOf(count, seedphraseWordCounts)) {
    return t('seedphrase_word_count_error', { count })
  }

  if (!walletCore.Mnemonic.isValid(cleaned)) {
    return t('seedphrase_invalid_error')
  }

  return null
}

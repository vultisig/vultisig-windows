import { isOneOf } from '@lib/utils/array/isOneOf'
import { WalletCore } from '@trustwallet/wallet-core'
import { TFunction } from 'i18next'

import { seedphraseWordCounts } from '../config'

type ValidateMnemonicInput = {
  mnemonic: string
  walletCore: WalletCore
  t: TFunction
}

type MnemonicValidationResult = {
  error: string | null
  isSkippable: boolean
}

export const cleanMnemonic = (text: string) =>
  text.split(/\s+/).filter(Boolean).join(' ')

export const validateMnemonic = ({
  mnemonic,
  walletCore,
  t,
}: ValidateMnemonicInput): MnemonicValidationResult => {
  const cleaned = cleanMnemonic(mnemonic)

  if (cleaned === '') {
    return { error: null, isSkippable: false }
  }

  const words = cleaned.split(' ')
  const count = words.length

  if (!isOneOf(count, seedphraseWordCounts)) {
    return {
      error: t('seedphrase_word_count_error', { count }),
      isSkippable: false,
    }
  }

  if (!walletCore.Mnemonic.isValid(cleaned)) {
    return {
      error: t('seedphrase_invalid_error'),
      isSkippable: true,
    }
  }

  return { error: null, isSkippable: false }
}

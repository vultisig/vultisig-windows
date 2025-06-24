import { generalSwapProviderName } from '@core/chain/swap/general/GeneralSwapProvider'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { KeysignSwapPayload } from './KeysignSwapPayload'

export const getKeysignSwapProviderName = (swapPayload: KeysignSwapPayload) =>
  matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
    native: ({ chain }) => chain,
    general: ({ provider }) => generalSwapProviderName[provider],
  })

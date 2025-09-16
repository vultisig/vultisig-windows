import {
  generalSwapProviderName,
  generalSwapProviders,
} from '@core/chain/swap/general/GeneralSwapProvider'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { KeysignSwapPayload } from './KeysignSwapPayload'

export const getKeysignSwapProviderName = (swapPayload: KeysignSwapPayload) =>
  matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
    native: ({ chain }) => chain,
    general: ({ provider }) =>
      isOneOf(provider, generalSwapProviders)
        ? generalSwapProviderName[provider]
        : provider,
  })

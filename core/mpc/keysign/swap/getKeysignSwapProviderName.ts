import { Chain } from '@core/chain/Chain'
import { generalSwapProviderName } from '@core/chain/swap/general/GeneralSwapProvider'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { KeysignSwapPayload } from './KeysignSwapPayload'

type Input = {
  swapPayload: KeysignSwapPayload
  chain: Chain
}

export const getKeysignSwapProviderName = ({ swapPayload, chain }: Input) =>
  matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
    native: () => chain,
    general: () => generalSwapProviderName.oneinch,
  })

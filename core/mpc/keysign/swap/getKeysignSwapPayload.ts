import { Chain } from '@core/chain/Chain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'

import { KeysignSwapPayload } from './KeysignSwapPayload'

export const getKeysignSwapPayload = ({
  swapPayload,
}: Pick<KeysignPayload, 'swapPayload'>): KeysignSwapPayload | undefined => {
  if (!swapPayload || !swapPayload.case || !swapPayload.value) {
    return undefined
  }

  return matchDiscriminatedUnion(swapPayload, 'case', 'value', {
    thorchainSwapPayload: value => ({
      native: { ...value, chain: Chain.THORChain },
    }),
    mayachainSwapPayload: value => ({
      native: { ...value, chain: Chain.MayaChain },
    }),
    oneinchSwapPayload: general => ({ general }),
    kyberswapSwapPayload: () => {
      throw new Error(
        'Kyberswap swap payload is deprecated and no longer supported'
      )
    },
  })
}

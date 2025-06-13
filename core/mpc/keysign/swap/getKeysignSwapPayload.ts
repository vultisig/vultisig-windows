import { SwapType } from '@core/chain/swap/quote/SwapQuote'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { KeysignSwapPayload } from './KeysignSwapPayload'

const swapTypeRecord: Record<
  NonNullable<KeysignPayload['swapPayload']['case']>,
  SwapType
> = {
  thorchainSwapPayload: 'native',
  mayachainSwapPayload: 'native',
  oneinchSwapPayload: 'general',
}

export const getKeysignSwapPayload = ({
  swapPayload,
}: Pick<KeysignPayload, 'swapPayload'>): KeysignSwapPayload | undefined => {
  if (!swapPayload || !swapPayload.case || !swapPayload.value) {
    return undefined
  }

  const swapType = swapTypeRecord[swapPayload.case]

  return {
    [swapType]: swapPayload.value,
  } as KeysignSwapPayload
}

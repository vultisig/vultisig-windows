import { Chain, VaultBasedCosmosChain } from '@core/chain/Chain'
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

const chainRecord: Record<
  NonNullable<KeysignPayload['swapPayload']['case']>,
  VaultBasedCosmosChain | undefined
> = {
  thorchainSwapPayload: Chain.THORChain,
  mayachainSwapPayload: Chain.MayaChain,
  oneinchSwapPayload: undefined,
}

export const getKeysignSwapPayload = ({
  swapPayload,
}: Pick<KeysignPayload, 'swapPayload'>): KeysignSwapPayload | undefined => {
  if (!swapPayload || !swapPayload.case || !swapPayload.value) {
    return undefined
  }

  const swapType = swapTypeRecord[swapPayload.case]
  const chain = chainRecord[swapPayload.case]

  if (swapType === 'native' && chain) {
    return {
      [swapType]: { ...swapPayload.value, chain },
    } as KeysignSwapPayload
  }

  return {
    [swapType]: swapPayload.value,
  } as KeysignSwapPayload
}

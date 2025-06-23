import { Chain, VaultBasedCosmosChain } from '@core/chain/Chain'
import { GeneralSwapProvider } from '@core/chain/swap/general/GeneralSwapProvider'
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
  kyberswapSwapPayload: 'general',
}

type NativeSwapPayloadCase = {
  [K in keyof typeof swapTypeRecord]: (typeof swapTypeRecord)[K] extends 'native'
    ? K
    : never
}[keyof typeof swapTypeRecord]

type GeneralSwapPayloadCase = {
  [K in keyof typeof swapTypeRecord]: (typeof swapTypeRecord)[K] extends 'general'
    ? K
    : never
}[keyof typeof swapTypeRecord]

const nativeChainRecord: Record<NativeSwapPayloadCase, VaultBasedCosmosChain> =
  {
    thorchainSwapPayload: Chain.THORChain,
    mayachainSwapPayload: Chain.MayaChain,
  }

const generalProviderRecord: Record<
  GeneralSwapPayloadCase,
  GeneralSwapProvider
> = {
  oneinchSwapPayload: 'oneinch',
  kyberswapSwapPayload: 'kyber',
}

export const getKeysignSwapPayload = ({
  swapPayload,
}: Pick<KeysignPayload, 'swapPayload'>): KeysignSwapPayload | undefined => {
  if (!swapPayload || !swapPayload.case || !swapPayload.value) {
    return undefined
  }

  const swapType = swapTypeRecord[swapPayload.case]

  if (swapType === 'native') {
    const chain = nativeChainRecord[swapPayload.case as NativeSwapPayloadCase]
    return {
      [swapType]: { ...swapPayload.value, chain },
    } as KeysignSwapPayload
  }

  if (swapType === 'general') {
    const provider =
      generalProviderRecord[swapPayload.case as GeneralSwapPayloadCase]
    return {
      [swapType]: { ...swapPayload.value, provider },
    } as KeysignSwapPayload
  }

  return {
    [swapType]: swapPayload.value,
  } as KeysignSwapPayload
}

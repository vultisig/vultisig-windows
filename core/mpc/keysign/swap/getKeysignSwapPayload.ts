import { GeneralSwapProvider } from '@core/chain/swap/general/GeneralSwapProvider'
import {
  NativeSwapPayloadCase,
  nativeSwapPayloadCase,
} from '@core/chain/swap/native/NativeSwapChain'
import { SwapType } from '@core/chain/swap/quote/SwapQuote'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'

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

type GeneralSwapPayloadCase = {
  [K in keyof typeof swapTypeRecord]: (typeof swapTypeRecord)[K] extends 'general'
    ? K
    : never
}[keyof typeof swapTypeRecord]

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
    const chain = mirrorRecord(nativeSwapPayloadCase)[
      swapPayload.case as NativeSwapPayloadCase
    ]
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

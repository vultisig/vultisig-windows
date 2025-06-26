import { VaultBasedCosmosChain } from '@core/chain/Chain'
import { GeneralSwapProvider } from '@core/chain/swap/general/GeneralSwapProvider'
import { SwapType } from '@core/chain/swap/quote/SwapQuote'
import { OneInchSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { THORChainSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'

import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { KyberSwapPayload } from '../../types/vultisig/keysign/v1/kyberswap_swap_payload_pb'

type NativeSwapPayload = THORChainSwapPayload & { chain: VaultBasedCosmosChain }

type GeneralSwapPayload = {
  provider: GeneralSwapProvider
} & (OneInchSwapPayload | KyberSwapPayload)

export type KeysignSwapPayload = {
  [T in SwapType]: {
    [K in T]: T extends 'native'
      ? NativeSwapPayload
      : T extends 'general'
        ? GeneralSwapPayload
        : never
  }
}[SwapType]

export type CommKeysignSwapPayload = Exclude<
  KeysignPayload['swapPayload'],
  { case: undefined; value?: undefined }
>

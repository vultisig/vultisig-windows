import { VaultBasedCosmosChain } from '@core/chain/Chain'
import { SwapType } from '@core/chain/swap/quote/SwapQuote'
import { OneInchSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KyberSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/kyberswap_swap_payload_pb'
import { THORChainSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'

import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'

type NativeSwapPayload = THORChainSwapPayload & { chain: VaultBasedCosmosChain }

export type KeysignSwapPayload = {
  [T in SwapType]: {
    [K in T]: T extends 'native'
      ? NativeSwapPayload
      : T extends 'general'
        ? OneInchSwapPayload
        : T extends 'hybrid'
          ? KyberSwapPayload
          : never
  }
}[SwapType]

export type CommKeysignSwapPayload = Exclude<
  KeysignPayload['swapPayload'],
  { case: undefined; value?: undefined }
>

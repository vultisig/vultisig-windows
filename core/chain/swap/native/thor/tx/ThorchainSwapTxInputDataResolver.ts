import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { THORChainSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { ThorChainSwapEnabledChain } from '../../NativeSwapChain'

export type GetThorchainSwapTxInputDataInput<
  T extends ThorChainSwapEnabledChain,
> = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  chain: T
  swapPayload: THORChainSwapPayload
}

export type ThorchainSwapTxInputDataResolver<
  T extends ThorChainSwapEnabledChain,
> = (input: GetThorchainSwapTxInputDataInput<T>) => Uint8Array<ArrayBufferLike>

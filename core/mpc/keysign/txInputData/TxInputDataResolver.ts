import { ChainKind, ChainsOfKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

export type GetTxInputDataInput<T extends ChainKind> = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  chain: ChainsOfKind<T>
}

export type TxInputDataResolver<T extends ChainKind> = (
  input: GetTxInputDataInput<T>
) => Uint8Array<ArrayBufferLike>[]

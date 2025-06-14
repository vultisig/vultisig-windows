import {
  ChainsBySpecific,
  KeysignChainSpecificKey,
  KeysignChainSpecificValueByKey,
} from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

export type GetTxInputDataInput<T extends KeysignChainSpecificKey> = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  chain: ChainsBySpecific<T>
  chainSpecific: KeysignChainSpecificValueByKey<T>
}

export type TxInputDataResolver<T extends KeysignChainSpecificKey> = (
  input: GetTxInputDataInput<T>
) => Uint8Array<ArrayBufferLike>[]

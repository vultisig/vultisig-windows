import {
  ChainsBySpecific,
  KeysignChainSpecificKey,
  KeysignChainSpecificValueByKey,
} from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { IMsgTransfer } from './ibc/IMsgTransfer'

export type GetPreSignedInputDataInput<T extends KeysignChainSpecificKey> = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  chain: ChainsBySpecific<T>
  chainSpecific: KeysignChainSpecificValueByKey<T>
  ibcTransaction?: IMsgTransfer
}

export type PreSignedInputDataResolver<T extends KeysignChainSpecificKey> = (
  input: GetPreSignedInputDataInput<T>
) => Uint8Array<ArrayBufferLike>

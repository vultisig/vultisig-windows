import { ChainKind, ChainOfKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

export type GetTxInputDataInput<T extends ChainKind> = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  chain: ChainOfKind<T>
} & (T extends 'utxo' ? { publicKey: PublicKey } : {})

export type TxInputDataResolver<T extends ChainKind> = Resolver<
  GetTxInputDataInput<T>,
  Uint8Array<ArrayBufferLike>[]
>

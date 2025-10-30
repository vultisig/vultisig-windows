import { ChainKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

type GetFeeAmountResolverInput<T extends ChainKind> = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
} & (T extends 'utxo' ? { publicKey: PublicKey } : {})

export type GetFeeAmountResolver<T extends ChainKind = ChainKind> = Resolver<
  GetFeeAmountResolverInput<T>,
  bigint
>

import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import { WalletCore } from '@trustwallet/wallet-core'

import { BlockaidSupportedChain } from '../../../chains'
import { BlockaidTxScanInput } from '../resolver'

export type BlockaidTxScanInputResolverInput<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = {
  payload: KeysignPayload
  walletCore: WalletCore
  chain: T
}

export type BlockaidTxScanInputResolver<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = Resolver<
  {
    payload: KeysignPayload
    walletCore: WalletCore
    chain: T
  },
  BlockaidTxScanInput['data'] | null
>

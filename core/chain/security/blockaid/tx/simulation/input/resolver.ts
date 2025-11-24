import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import { WalletCore } from '@trustwallet/wallet-core'

import { BlockaidSimulationSupportedChain } from '../../../simulationChains'
import { BlockaidTxSimulationInput } from '../resolver'

export type BlockaidTxSimulationInputResolverInput<
  T extends BlockaidSimulationSupportedChain = BlockaidSimulationSupportedChain,
> = {
  payload: KeysignPayload
  walletCore: WalletCore
  chain: T
}

export type BlockaidTxSimulationInputResolver<
  T extends BlockaidSimulationSupportedChain = BlockaidSimulationSupportedChain,
> = Resolver<
  {
    payload: KeysignPayload
    walletCore: WalletCore
    chain: T
  },
  BlockaidTxSimulationInput['data'] | null
>

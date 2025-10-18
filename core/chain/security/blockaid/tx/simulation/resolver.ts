import { Resolver } from '@lib/utils/types/Resolver'

import { BlockaidSupportedChain } from '../../chains'
import { BlockaidSimulation } from './api/core'

export type BlockaidTxSimulationInput<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = {
  chain: T
  data: Record<string, unknown>
}

export type BlockaidTxSimulationResolver<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = Resolver<BlockaidTxSimulationInput<T>, Promise<BlockaidSimulation>>

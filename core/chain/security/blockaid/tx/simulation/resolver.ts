import { Resolver } from '@lib/utils/types/Resolver'

import { BlockaidSimulationSupportedChain } from '../../simulationChains'
import { BlockaidSimulation } from './api/core'

export type BlockaidTxSimulationInput<
  T extends BlockaidSimulationSupportedChain = BlockaidSimulationSupportedChain,
> = {
  chain: T
  data: Record<string, unknown>
}

export type BlockaidTxSimulationResolver<
  T extends BlockaidSimulationSupportedChain = BlockaidSimulationSupportedChain,
> = Resolver<BlockaidTxSimulationInput<T>, Promise<BlockaidSimulation>>

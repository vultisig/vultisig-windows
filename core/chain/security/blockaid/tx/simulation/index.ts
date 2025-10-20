import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'

import { BlockaidSimulationSupportedChain } from '../../simulationChains'
import { BlockaidSimulation } from './api/core'
import {
  BlockaidTxSimulationInput,
  BlockaidTxSimulationResolver,
} from './resolver'
import { getSolanaTxBlockaidSimulation } from './resolvers/solana'

const resolvers: Record<
  DeriveChainKind<BlockaidSimulationSupportedChain>,
  BlockaidTxSimulationResolver<any>
> = {
  solana: getSolanaTxBlockaidSimulation,
}

export const getTxBlockaidSimulation = async (
  input: BlockaidTxSimulationInput
): Promise<BlockaidSimulation> => {
  const chainKind = getChainKind(input.chain)

  return resolvers[chainKind](input)
}

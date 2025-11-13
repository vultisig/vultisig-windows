import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'

import { BlockaidSimulationSupportedChain } from '../../simulationChains'
import { BlockaidEVMSimulation, BlockaidSolanaSimulation } from './api/core'
import {
  BlockaidTxSimulationInput,
  BlockaidTxSimulationResolver,
} from './resolver'
import { getEvmTxBlockaidSimulation } from './resolvers/evm'
import { getSolanaTxBlockaidSimulation } from './resolvers/solana'

const resolvers: Record<
  DeriveChainKind<BlockaidSimulationSupportedChain>,
  BlockaidTxSimulationResolver<any>
> = {
  solana: getSolanaTxBlockaidSimulation,
  evm: getEvmTxBlockaidSimulation,
}

export const getTxBlockaidSimulation = async (
  input: BlockaidTxSimulationInput
): Promise<BlockaidEVMSimulation | BlockaidSolanaSimulation> => {
  const chainKind = getChainKind(input.chain)

  return resolvers[chainKind](input)
}

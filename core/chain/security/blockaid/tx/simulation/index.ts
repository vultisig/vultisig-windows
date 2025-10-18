import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'

import { BlockaidSupportedChain } from '../../chains'
import { BlockaidSimulation } from './api/core'
import {
  BlockaidTxSimulationInput,
  BlockaidTxSimulationResolver,
} from './resolver'
import { getSolanaTxBlockaidSimulation } from './resolvers/solana'

const resolvers: Record<
  DeriveChainKind<BlockaidSupportedChain>,
  BlockaidTxSimulationResolver<any>
> = {
  solana: getSolanaTxBlockaidSimulation,
  evm: () => {
    throw new Error('EVM simulation not supported')
  },
  utxo: () => {
    throw new Error('Utxo simulation not supported')
  },
  sui: () => {
    throw new Error('Sui simulation not supported')
  },
}

export const getTxBlockaidSimulation = async (
  input: BlockaidTxSimulationInput
): Promise<BlockaidSimulation> => {
  const chainKind = getChainKind(input.chain)

  return resolvers[chainKind](input)
}

import { Chain, EvmChain } from '@core/chain/Chain'
import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'

import { BlockaidSimulationSupportedChain } from '../../simulationChains'
import {
  BlockaidSimulationForChainKind,
  BlockaidTxSimulationInput,
  BlockaidTxSimulationResolver,
} from './resolver'
import { getEvmTxBlockaidSimulation } from './resolvers/evm'
import { getSolanaTxBlockaidSimulation } from './resolvers/solana'

type ResolverMap = {
  evm: BlockaidTxSimulationResolver<any, 'evm'>
  solana: BlockaidTxSimulationResolver<any, 'solana'>
}

const resolvers: ResolverMap = {
  solana: getSolanaTxBlockaidSimulation,
  evm: getEvmTxBlockaidSimulation,
}

export function getTxBlockaidSimulation(
  input: BlockaidTxSimulationInput<EvmChain>
): Promise<BlockaidSimulationForChainKind<'evm'>>

export function getTxBlockaidSimulation(
  input: BlockaidTxSimulationInput<typeof Chain.Solana>
): Promise<BlockaidSimulationForChainKind<'solana'>>

export async function getTxBlockaidSimulation<
  T extends BlockaidSimulationSupportedChain,
>(
  input: BlockaidTxSimulationInput<T>
): Promise<BlockaidSimulationForChainKind<DeriveChainKind<T>>> {
  const chainKind = getChainKind(input.chain)

  if (chainKind === 'solana') {
    return resolvers.solana(input) as Promise<
      BlockaidSimulationForChainKind<DeriveChainKind<T>>
    >
  }

  return resolvers.evm(input) as Promise<
    BlockaidSimulationForChainKind<DeriveChainKind<T>>
  >
}

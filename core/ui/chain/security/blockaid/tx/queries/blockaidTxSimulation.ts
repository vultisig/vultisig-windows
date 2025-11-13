import { EvmChain } from '@core/chain/Chain'
import { Chain } from '@core/chain/Chain'
import { getChainKind, isChainOfKind } from '@core/chain/ChainKind'
import { BlockaidSimulationSupportedChainKind } from '@core/chain/security/blockaid/simulationChains'
import { getTxBlockaidSimulation } from '@core/chain/security/blockaid/tx/simulation'
import {
  BlockaidSimulationForChainKind,
  BlockaidTxSimulationInput,
} from '@core/chain/security/blockaid/tx/simulation/resolver'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

type BlockaidTxSimulationQueryResult<
  K extends BlockaidSimulationSupportedChainKind,
> = {
  queryKey: unknown[]
  queryFn: () => Promise<BlockaidSimulationForChainKind<K>>
} & typeof noRefetchQueryOptions

type BlockaidTxSimulationQueryResolver<
  K extends BlockaidSimulationSupportedChainKind,
> = (input: BlockaidTxSimulationInput) => BlockaidTxSimulationQueryResult<K>

const getEvmBlockaidTxSimulationQuery: BlockaidTxSimulationQueryResolver<
  'evm'
> = input => {
  const evmChain = shouldBePresent(
    isChainOfKind(input.chain, 'evm') ? input.chain : null,
    'evm chain'
  )
  const evmInput: BlockaidTxSimulationInput<EvmChain> = {
    chain: evmChain,
    data: input.data,
  }
  return {
    queryKey: ['blockaidTxSimulation', input],
    queryFn: async () => getTxBlockaidSimulation(evmInput),
    ...noRefetchQueryOptions,
  }
}

const getSolanaBlockaidTxSimulationQuery: BlockaidTxSimulationQueryResolver<
  'solana'
> = input => {
  const solanaChain = shouldBePresent(
    input.chain === Chain.Solana ? input.chain : null,
    'solana chain'
  )

  const solanaInput: BlockaidTxSimulationInput<typeof Chain.Solana> = {
    chain: solanaChain,
    data: input.data,
  }

  return {
    queryKey: ['blockaidTxSimulation', input],
    queryFn: async () => getTxBlockaidSimulation(solanaInput),
    ...noRefetchQueryOptions,
  }
}

const queryResolvers: Record<
  BlockaidSimulationSupportedChainKind,
  BlockaidTxSimulationQueryResolver<any>
> = {
  evm: getEvmBlockaidTxSimulationQuery,
  solana: getSolanaBlockaidTxSimulationQuery,
}

export function getBlockaidTxSimulationQuery(
  input: BlockaidTxSimulationInput<EvmChain>
): BlockaidTxSimulationQueryResult<'evm'>

export function getBlockaidTxSimulationQuery(
  input: BlockaidTxSimulationInput<typeof Chain.Solana>
): BlockaidTxSimulationQueryResult<'solana'>

export function getBlockaidTxSimulationQuery(
  input: BlockaidTxSimulationInput
): BlockaidTxSimulationQueryResult<BlockaidSimulationSupportedChainKind> {
  const chainKind = getChainKind(input.chain)
  return queryResolvers[chainKind](input)
}

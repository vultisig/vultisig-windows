import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { BlockaidSupportedEvmChain } from '@core/chain/security/blockaid/evmChains'
import { getTxBlockaidSimulation } from '@core/chain/security/blockaid/tx/simulation'
import { BlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/resolver'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'

export const getBlockaidTxSimulationQuery = (
  input: BlockaidTxSimulationInput
) => {
  if (isChainOfKind(input.chain, 'solana')) {
    return {
      queryKey: ['blockaidTxSimulation', input],
      queryFn: async () =>
        getTxBlockaidSimulation(
          input as BlockaidTxSimulationInput<typeof Chain.Solana>
        ),
      ...noRefetchQueryOptions,
    }
  }

  return {
    queryKey: ['blockaidTxSimulation', input],
    queryFn: async () =>
      getTxBlockaidSimulation(
        input as BlockaidTxSimulationInput<BlockaidSupportedEvmChain>
      ),
    ...noRefetchQueryOptions,
  }
}

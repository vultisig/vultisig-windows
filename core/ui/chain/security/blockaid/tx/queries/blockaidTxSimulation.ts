import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { BlockaidSupportedEvmChain } from '@vultisig/core-chain/security/blockaid/evmChains'
import { getTxBlockaidSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation'
import { BlockaidTxSimulationInput } from '@vultisig/core-chain/security/blockaid/tx/simulation/resolver'

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

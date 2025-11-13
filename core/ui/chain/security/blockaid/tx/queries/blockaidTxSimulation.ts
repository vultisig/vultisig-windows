import { getTxBlockaidSimulation } from '@core/chain/security/blockaid/tx/simulation'
import { BlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/resolver'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'

export const getBlockaidTxSimulationQuery = (
  input: BlockaidTxSimulationInput
) => ({
  queryKey: ['blockaidTxSimulation', input],
  queryFn: async () => getTxBlockaidSimulation(input),
  ...noRefetchQueryOptions,
})

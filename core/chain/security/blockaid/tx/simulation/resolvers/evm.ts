import { EvmChain } from '@core/chain/Chain'

import { queryBlockaid } from '../../../core/query'
import { BlockaidEVMSimulation } from '../api/core'
import { BlockaidTxSimulationResolver } from '../resolver'

type EvmBlockaidScanResponse = {
  simulation: BlockaidEVMSimulation
}

export const getEvmTxBlockaidSimulation: BlockaidTxSimulationResolver<
  EvmChain,
  'evm'
> = async ({ data }) => {
  const { simulation } = await queryBlockaid<EvmBlockaidScanResponse>(
    '/evm/json-rpc/scan',
    data
  )
  return simulation
}

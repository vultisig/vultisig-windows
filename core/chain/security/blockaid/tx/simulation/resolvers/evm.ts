import { queryBlockaid } from '../../../core/query'
import { BlockaidEVMSimulation } from '../api/core'
import { BlockaidTxSimulationResolver } from '../resolver'

type EvmBlockaidScanResponse = {
  simulation: BlockaidEVMSimulation
}

export const getEvmTxBlockaidSimulation: BlockaidTxSimulationResolver = async ({
  data,
}) => {
  const { simulation } = await queryBlockaid<EvmBlockaidScanResponse>(
    '/evm/json-rpc/scan',
    data
  )
  return simulation
}

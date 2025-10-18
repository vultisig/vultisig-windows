import { queryBlockaid } from '../../../core/query'
import { BlockaidSimulation } from '../api/core'
import { BlockaidTxSimulationResolver } from '../resolver'

type SolanaBlockaidScanResponse = {
  result: {
    simulation: BlockaidSimulation
  }
}

export const getSolanaTxBlockaidSimulation: BlockaidTxSimulationResolver =
  async ({ data }) => {
    const { result } = await queryBlockaid<SolanaBlockaidScanResponse>(
      '/solana/message/scan',
      data
    )

    return result.simulation
  }

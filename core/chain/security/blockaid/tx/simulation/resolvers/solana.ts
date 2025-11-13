import { queryBlockaid } from '../../../core/query'
import { BlockaidSolanaSimulation } from '../api/core'
import { BlockaidTxSimulationResolver } from '../resolver'

type SolanaBlockaidScanResponse = {
  result: {
    simulation: BlockaidSolanaSimulation
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

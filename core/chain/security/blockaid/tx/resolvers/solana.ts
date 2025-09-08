import { queryBlockaid } from '../../core/query'
import { BlockaidValidation } from '../api/core'
import { BlockaidTxValidationResolver } from '../resolver'

type SolanaBlockaidScanResponse = {
  result: {
    validation: BlockaidValidation
  }
}

export const getSolanaTxBlockaidValidation: BlockaidTxValidationResolver =
  async ({ data }) => {
    const { result } = await queryBlockaid<SolanaBlockaidScanResponse>(
      '/solana/message/scan',
      data
    )

    return result.validation
  }

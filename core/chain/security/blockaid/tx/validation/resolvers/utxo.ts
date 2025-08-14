import { BlockaidValidation } from '../api/core'
import { queryBlockaid } from '../api/query'
import { BlockaidTxValidationResolver } from '../resolver'

type BitcoinBlockaidScanResponse = {
  validation: BlockaidValidation
}

export const getUtxoTxBlockaidValidation: BlockaidTxValidationResolver =
  async ({ data }) => {
    const { validation } = await queryBlockaid<BitcoinBlockaidScanResponse>(
      '/bitcoin/transaction-raw/scan',
      data
    )

    return validation
  }

import { queryBlockaid } from '../../../core/query'
import { BlockaidValidation } from '../api/core'
import { BlockaidTxValidationResolver } from '../resolver'

type BitcoinBlockaidScanResponse = {
  validation: BlockaidValidation
}

export const getUtxoTxBlockaidValidation: BlockaidTxValidationResolver =
  async ({ data, chain }) => {
    console.log('data in getUtxoTxBlockaidValidation', data)

    const { validation } = await queryBlockaid<BitcoinBlockaidScanResponse>(
      `/${chain.toLowerCase()}/transaction-raw/scan`,
      data
    )

    return validation
  }

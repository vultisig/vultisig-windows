import { OtherChain } from '@core/chain/Chain'

import { BlockaidValidation } from '../api/core'
import { queryBlockaid } from '../api/query'
import { BlockaidTxValidationResolver } from '../resolver'

type SuiBlockaidScanResponse = {
  validation: BlockaidValidation
}

export const getSuiTxBlockaidValidation: BlockaidTxValidationResolver<
  OtherChain.Sui
> = async ({ data }) => {
  const { validation } = await queryBlockaid<SuiBlockaidScanResponse>(
    '/sui/transaction/scan',
    data
  )

  return validation
}

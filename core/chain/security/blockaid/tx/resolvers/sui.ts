import { OtherChain } from '@core/chain/Chain'

import { queryBlockaid } from '../../core/query'
import { BlockaidValidation } from '../api/core'
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

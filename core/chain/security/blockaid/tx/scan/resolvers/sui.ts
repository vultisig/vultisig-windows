import { OtherChain } from '@core/chain/Chain'

import { BlockaidValidation, parseBlockaidValidation } from '../api/core'
import { queryBlockaid } from '../api/query'
import { BlockaidTxScanResolver } from '../resolver'

type SuiBlockaidScanResponse = {
  validation: BlockaidValidation
}

export const scanSuiTxWithBlockaid: BlockaidTxScanResolver<
  OtherChain.Sui
> = async ({ data }) => {
  const { validation } = await queryBlockaid<SuiBlockaidScanResponse>(
    '/sui/transaction/scan',
    data
  )

  return parseBlockaidValidation(validation)
}

import { queryBlockaid } from '../../../core/query'
import { BlockaidValidation } from '../api/core'
import { BlockaidTxValidationResolver } from '../resolver'

type BlockaidScanResponse = {
  validation: BlockaidValidation
}

export const getEvmTxBlockaidValidation: BlockaidTxValidationResolver = async ({
  data,
}) => {
  const { validation } = await queryBlockaid<BlockaidScanResponse>(
    '/evm/json-rpc/scan',
    data
  )

  return validation
}

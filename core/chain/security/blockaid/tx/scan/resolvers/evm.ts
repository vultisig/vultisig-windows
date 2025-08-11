import { BlockaidValidation, parseBlockaidValidation } from '../api/core'
import { queryBlockaid } from '../api/query'
import { BlockaidTxScanResolver } from '../resolver'

type BlockaidScanResponse = {
  validation: BlockaidValidation
}

export const scanEvmTxWithBlockaid: BlockaidTxScanResolver = async ({
  data,
}) => {
  const { validation } = await queryBlockaid<BlockaidScanResponse>(
    '/evm/json-rpc/scan',
    data
  )

  return parseBlockaidValidation(validation)
}

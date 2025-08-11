import { EvmChain } from '@core/chain/Chain'
import { productRootDomain } from '@core/config'

import {
  BlockaidValidation,
  getRiskLevelFromBlockaidValidation,
} from '../api/core'
import { queryBlockaid } from '../api/query'
import { BlockaidTxScanResolver } from '../resolver'

type BlockaidScanResponse = {
  validation: BlockaidValidation & {
    description: string
  }
}

export const scanEvmTxWithBlockaid: BlockaidTxScanResolver<EvmChain> = async ({
  chain,
  data,
}) => {
  const body = {
    chain: chain.toLowerCase(),
    data,
    metadata: {
      domain: productRootDomain,
    },
  }

  const { validation } = await queryBlockaid<BlockaidScanResponse>(
    '/evm/json-rpc/scan',
    body
  )

  const { description } = validation

  const level = getRiskLevelFromBlockaidValidation(validation)

  if (level === null) {
    return null
  }

  return {
    level,
    description,
  }
}

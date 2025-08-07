import { EvmChain } from '@core/chain/Chain'
import { productRootDomain } from '@core/config'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { queryBlockaid } from '../api'
import { TxRiskLevel } from '../core'
import { BlockaidRiskLevel, blockaidRiskyTxLevels } from '../input/api'
import { BlockaidTxScanResolver } from '../resolver'

type BlockaidScanResponse = {
  validation: {
    result_type: BlockaidRiskLevel | string
    description: string
  }
}

const blockaidRiskLevelToTxRiskLevel: Record<BlockaidRiskLevel, TxRiskLevel> = {
  Warning: 'medium',
  Malicious: 'high',
  Spam: 'high',
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

  const { result_type, description } = validation

  if (!isOneOf(result_type, blockaidRiskyTxLevels)) {
    return null
  }

  return {
    level: blockaidRiskLevelToTxRiskLevel[result_type],
    description,
  }
}

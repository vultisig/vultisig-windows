import { EvmChain } from '@core/chain/Chain'
import { productRootDomain, rootApiUrl } from '@core/config'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { blockaidBaseUrl } from '../../../config'
import { TxRiskLevel } from '../core'
import { BlockaidTxScanResolver } from '../resolver'

const blockaidRiskyTxLevels = ['Warning', 'Malicious', 'Spam'] as const

type BlockaidRiskLevel = (typeof blockaidRiskyTxLevels)[number]

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

  const { validation } = await queryUrl<BlockaidScanResponse>(
    `${blockaidBaseUrl}/evm/json-rpc/scan`,
    {
      body,
      headers: {
        origin: rootApiUrl,
      },
    }
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

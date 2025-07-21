import { productRootDomain, rootApiUrl } from '@core/config'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { EvmChain } from '../../../Chain'
import { blockaidBaseUrl } from '../config'

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

export type TxRiskLevel = 'medium' | 'high'

type RiskyTxInfo = {
  level: TxRiskLevel
  description: string
}

export type BlockaidTxScanInput = {
  chain: EvmChain
  data: unknown
}

export type BlockaidTxScanResult = RiskyTxInfo | null

export const scanTxWithBlockaid = async (input: BlockaidTxScanInput) => {
  const { chain, data } = input

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

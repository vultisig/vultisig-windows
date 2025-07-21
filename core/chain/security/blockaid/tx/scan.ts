import { productRootDomain, rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { EvmChain } from '../../../Chain'
import { blockaidBaseUrl } from '../config'

type BlockaidRiskLevel = 'Benign' | 'Warning' | 'Malicious' | 'Spam'

type BlockaidScanResponse = {
  validation: {
    result_type: BlockaidRiskLevel
  }
}

const blockaidRiskLevelToTxRiskLevel: Record<BlockaidRiskLevel, TxRiskLevel> = {
  Benign: 'low',
  Warning: 'medium',
  Malicious: 'high',
  Spam: 'high',
}

export type TxRiskLevel = 'low' | 'medium' | 'high'

export type BlockaidTxScanInput = {
  chain: EvmChain
  data: unknown
}

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

  return blockaidRiskLevelToTxRiskLevel[validation.result_type]
}

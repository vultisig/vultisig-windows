import { OtherChain } from '@core/chain/Chain'
import { productRootDomain, rootApiUrl } from '@core/config'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { blockaidBaseUrl } from '../../../config'
import { TxRiskLevel } from '../core'
import { BlockaidTxScanResolver } from '../resolver'

const blockaidRiskyTxLevels = ['Warning', 'Malicious', 'Spam'] as const

type BlockaidRiskLevel = (typeof blockaidRiskyTxLevels)[number]

type SolanaBlockaidScanResponse = {
  result: {
    validation: {
      result_type: BlockaidRiskLevel | string
      reason: string
      features: string[]
      extended_features: Array<{
        type: string
        description: string
      }>
    }
  }
}

const blockaidRiskLevelToTxRiskLevel: Record<BlockaidRiskLevel, TxRiskLevel> = {
  Warning: 'medium',
  Malicious: 'high',
  Spam: 'high',
}

export const scanSolanaTxWithBlockaid: BlockaidTxScanResolver<
  OtherChain.Solana
> = async ({ data }) => {
  const body = {
    chain: 'mainnet',
    metadata: {
      type: 'wallet',
      url: productRootDomain,
    },
    options: ['validation'],
    ...(data as Record<string, unknown>),
  }

  const response = await queryUrl<SolanaBlockaidScanResponse>(
    `${blockaidBaseUrl}/solana/message/scan`,
    {
      body,
      headers: {
        origin: rootApiUrl,
      },
    }
  )

  const { result_type, reason, extended_features } = response.result.validation

  if (!isOneOf(result_type, blockaidRiskyTxLevels)) {
    return null
  }

  const description =
    extended_features.length > 0
      ? extended_features.map(f => f.description).join('\n')
      : reason

  return {
    level: blockaidRiskLevelToTxRiskLevel[result_type],
    description,
  }
}

import { OtherChain } from '@core/chain/Chain'
import { productRootDomain, rootApiUrl } from '@core/config'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { blockaidBaseUrl } from '../../../config'
import { TxRiskLevel } from '../core'
import { BlockaidTxScanResolver } from '../resolver'

const blockaidRiskyTxLevels = ['warning', 'malicious', 'spam'] as const

type BlockaidRiskLevel = (typeof blockaidRiskyTxLevels)[number]

type SolanaBlockaidScanResponse = {
  status?: string
  error?: string
  result?: {
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
  warning: 'medium',
  malicious: 'high',
  spam: 'high',
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

  // Check for errors first (like iOS implementation)
  if (response.status?.toLowerCase() === 'error' || response.error) {
    throw new Error(response.error ?? 'Unknown error')
  }

  if (!response.result) {
    throw new Error("'result' is null")
  }

  const { result_type, reason, features, extended_features } =
    response.result.validation

  // Implement Solana-specific risk level logic like iOS
  const resultTypeLower = result_type.toLowerCase()
  const isBenign = resultTypeLower === 'benign' && features.length === 0

  if (isBenign) {
    return null
  }

  // Check if it's a risky transaction
  if (!isOneOf(resultTypeLower, blockaidRiskyTxLevels)) {
    return null
  }

  const description =
    extended_features.length > 0
      ? extended_features.map(f => f.description).join('\n')
      : reason

  return {
    level: blockaidRiskLevelToTxRiskLevel[resultTypeLower as BlockaidRiskLevel],
    description,
  }
}

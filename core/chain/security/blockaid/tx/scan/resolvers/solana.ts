import { OtherChain } from '@core/chain/Chain'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { queryBlockaid } from '../api/query'
import {
  BlockaidRiskLevel,
  blockaidRiskLevelToTxRiskLevel,
  blockaidRiskyTxLevels,
} from '../api/core'
import { BlockaidTxScanResolver } from '../resolver'

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

export const scanSolanaTxWithBlockaid: BlockaidTxScanResolver<
  OtherChain.Solana
> = async ({ data }) => {
  const { result } = await queryBlockaid<SolanaBlockaidScanResponse>(
    '/solana/message/scan',
    data
  )

  const { validation } = result

  const { result_type, reason, extended_features } = validation

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

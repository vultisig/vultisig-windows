import { OtherChain } from '@core/chain/Chain'

import {
  BlockaidValidation,
  getRiskLevelFromBlockaidValidation,
} from '../api/core'
import { queryBlockaid } from '../api/query'
import { BlockaidTxScanResolver } from '../resolver'

type SolanaBlockaidScanResponse = {
  result: {
    validation: BlockaidValidation & {
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

  const level = getRiskLevelFromBlockaidValidation(validation)

  if (level === null) {
    return null
  }

  const { reason, extended_features, features } = validation

  const getDescription = () => {
    if (extended_features.length > 0) {
      return extended_features.map(f => f.description).join('\n')
    }

    if (features.length > 0) {
      return features.join('\n')
    }

    return reason
  }

  return {
    level,
    description: getDescription(),
  }
}

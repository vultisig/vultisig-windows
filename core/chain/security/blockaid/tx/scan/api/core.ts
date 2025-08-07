import { isOneOf } from '@lib/utils/array/isOneOf'

import { TxRiskLevel } from '../core'

const blockaidRiskyTxLevels = ['Warning', 'Malicious', 'Spam'] as const

type BlockaidRiskLevel = (typeof blockaidRiskyTxLevels)[number]

const blockaidRiskLevelToTxRiskLevel: Record<BlockaidRiskLevel, TxRiskLevel> = {
  Warning: 'medium',
  Malicious: 'high',
  Spam: 'high',
}

export type BlockaidValidation = {
  result_type: BlockaidRiskLevel | string
}

export const getRiskLevelFromBlockaidValidation = (
  validation: BlockaidValidation
): TxRiskLevel | null => {
  const { result_type } = validation

  if (!isOneOf(result_type, blockaidRiskyTxLevels)) {
    return null
  }

  return blockaidRiskLevelToTxRiskLevel[result_type]
}

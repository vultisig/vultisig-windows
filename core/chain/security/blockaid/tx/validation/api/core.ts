import { isOneOf } from '@lib/utils/array/isOneOf'

import { RiskLevel } from '../../../core/riskLevel'
import { BlockaidValidationResult } from '../core'

const blockaidRiskyTxLevels = ['Warning', 'Malicious', 'Spam'] as const

type BlockaidRiskLevel = (typeof blockaidRiskyTxLevels)[number]

const blockaidRiskLevelToTxRiskLevel: Record<BlockaidRiskLevel, RiskLevel> = {
  Warning: 'medium',
  Malicious: 'high',
  Spam: 'high',
}

export type BlockaidValidation = {
  result_type: BlockaidRiskLevel | string
  description?: string
  reason?: string
  features?: Array<{
    description: string
  }>
  extended_features?: Array<{
    description: string
  }>
}

const getRiskLevelFromBlockaidValidation = ({
  result_type,
}: BlockaidValidation): RiskLevel | null => {
  if (!isOneOf(result_type, blockaidRiskyTxLevels)) {
    return null
  }

  return blockaidRiskLevelToTxRiskLevel[result_type]
}

export const parseBlockaidValidation = (
  validation: BlockaidValidation
): BlockaidValidationResult => {
  const level = getRiskLevelFromBlockaidValidation(validation)
  if (level === null) {
    return null
  }

  return {
    level,
  }
}

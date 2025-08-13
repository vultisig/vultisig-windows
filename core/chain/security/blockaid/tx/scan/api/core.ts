import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { BlockaidTxScanResult, TxRiskLevel } from '../core'

const blockaidRiskyTxLevels = ['Warning', 'Malicious', 'Spam'] as const

type BlockaidRiskLevel = (typeof blockaidRiskyTxLevels)[number]

const blockaidRiskLevelToTxRiskLevel: Record<BlockaidRiskLevel, TxRiskLevel> = {
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
}: BlockaidValidation): TxRiskLevel | null => {
  if (!isOneOf(result_type, blockaidRiskyTxLevels)) {
    return null
  }

  return blockaidRiskLevelToTxRiskLevel[result_type]
}

const getDescriptionFromBlockaidValidation = ({
  description,
  reason,
  extended_features,
  features,
}: BlockaidValidation): string => {
  if (description) {
    return description
  }

  if (extended_features && extended_features.length > 0) {
    return extended_features.map(f => f.description).join('\n')
  }

  if (features && features.length > 0) {
    return features.map(f => f.description).join('\n')
  }

  return shouldBePresent(reason)
}

export const parseBlockaidValidation = (
  validation: BlockaidValidation
): BlockaidTxScanResult => {
  const level = getRiskLevelFromBlockaidValidation(validation)
  if (level === null) {
    return null
  }

  return {
    level,
    description: getDescriptionFromBlockaidValidation(validation),
  }
}

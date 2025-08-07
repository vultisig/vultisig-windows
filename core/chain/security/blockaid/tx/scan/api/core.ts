import { TxRiskLevel } from '../core'

export const blockaidRiskyTxLevels = ['Warning', 'Malicious', 'Spam'] as const

export type BlockaidRiskLevel = (typeof blockaidRiskyTxLevels)[number]

export const blockaidRiskLevelToTxRiskLevel: Record<
  BlockaidRiskLevel,
  TxRiskLevel
> = {
  Warning: 'medium',
  Malicious: 'high',
  Spam: 'high',
}

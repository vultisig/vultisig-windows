import { RiskLevel } from '../../core/riskLevel'

type RiskyTxInfo = {
  level: RiskLevel
}

export type BlockaidValidationResult = RiskyTxInfo | null

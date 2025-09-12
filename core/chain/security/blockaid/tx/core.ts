import { RiskLevel } from '../core/riskLevel'

type RiskyTxInfo = {
  level: RiskLevel
  description: string
}

export type BlockaidTxScanResult = RiskyTxInfo | null

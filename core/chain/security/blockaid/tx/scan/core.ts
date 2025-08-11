export type TxRiskLevel = 'medium' | 'high'

export type RiskyTxInfo = {
  level: TxRiskLevel
  description: string
}

export type BlockaidTxScanResult = RiskyTxInfo | null

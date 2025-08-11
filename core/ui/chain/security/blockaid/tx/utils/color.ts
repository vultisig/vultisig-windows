import { TxRiskLevel } from '@core/chain/security/blockaid/tx/scan/core'
import { match } from '@lib/utils/match'
import { DefaultTheme } from 'styled-components'

export const getRiskyTxColor = (
  riskLevel: TxRiskLevel,
  colors: DefaultTheme['colors']
) =>
  match(riskLevel, {
    medium: () => colors.idle,
    high: () => colors.danger,
  }).toCssValue()

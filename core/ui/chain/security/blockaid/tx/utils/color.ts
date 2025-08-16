import { TxRiskLevel } from '@core/chain/security/blockaid/tx/validation/core'
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

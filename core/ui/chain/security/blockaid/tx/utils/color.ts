import { RiskLevel } from '@vultisig/core-chain/security/blockaid/core/riskLevel'
import { match } from '@vultisig/lib-utils/match'
import { DefaultTheme } from 'styled-components'

export const getRiskyTxColor = (
  riskLevel: RiskLevel,
  colors: DefaultTheme['colors']
) =>
  match(riskLevel, {
    medium: () => colors.idle,
    high: () => colors.danger,
  }).toCssValue()

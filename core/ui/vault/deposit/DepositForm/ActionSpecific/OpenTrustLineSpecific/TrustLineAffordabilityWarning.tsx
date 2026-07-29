import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { useTranslation } from 'react-i18next'

import { useDepositBalance } from '../../../hooks/useDepositBalance'
import { useRippleTrustLineCostXrp } from '../../../hooks/useRippleTrustLineCostXrp'

/**
 * Explains a blocked Open Trust Line: the same shortfall also fails the form
 * schema, so without this the submit button would be disabled with no reason
 * given. Renders nothing while the cost is unknown or the activation is
 * affordable.
 */
export const TrustLineAffordabilityWarning = () => {
  const { t } = useTranslation()
  const { balance } = useDepositBalance({
    selectedChainAction: 'open_trust_line',
  })
  const costXrp = useRippleTrustLineCostXrp(true)

  if (costXrp === undefined || balance >= costXrp) {
    return null
  }

  return (
    <WarningBlock>
      {t('trust_line_insufficient_xrp', {
        amount: costXrp,
        ticker: chainFeeCoin[Chain.Ripple].ticker,
      })}
    </WarningBlock>
  )
}

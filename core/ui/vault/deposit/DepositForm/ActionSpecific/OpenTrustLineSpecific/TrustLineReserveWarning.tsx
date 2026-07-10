import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { rippleOwnerReserveDrops } from '@vultisig/core-chain/chains/ripple/issuedCurrency'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { useTranslation } from 'react-i18next'

const xrp = chainFeeCoin[Chain.Ripple]

/**
 * Warns that opening an XRPL trust line raises the account's owner reserve by
 * one increment (0.2 XRP), locking that amount until the line is removed.
 */
export const TrustLineReserveWarning = () => {
  const { t } = useTranslation()

  return (
    <WarningBlock>
      {t('trust_line_reserve_warning', {
        amount: fromChainAmount(rippleOwnerReserveDrops, xrp.decimals),
        ticker: xrp.ticker,
      })}
    </WarningBlock>
  )
}

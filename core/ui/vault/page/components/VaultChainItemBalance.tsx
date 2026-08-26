import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { VaultChainCoin } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'
import { sum } from '@vultisig/lib-utils/array/sum'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

type VaultChainItemBalanceProps = {
  coins: VaultChainCoin[]
}

/**
 * Fiat total and asset summary of a chain whose balances resolved, shown on the
 * right side of its portfolio row.
 */
export const VaultChainItemBalance = ({
  coins,
}: VaultChainItemBalanceProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()

  const singleCoin = coins.length === 1 ? coins[0] : null

  const totalAmount = sum(
    coins.map(coin =>
      getCoinValue({
        price: coin.price ?? 0,
        amount: coin.amount,
        decimals: coin.decimals,
      })
    )
  )

  return (
    <>
      <Text centerVertically color="contrast" weight="550" size={14}>
        <BalanceVisibilityAware>
          {formatFiatAmount(totalAmount)}
        </BalanceVisibilityAware>
      </Text>
      <Text color="shy" weight="500" size={12} centerVertically>
        {singleCoin ? (
          <BalanceVisibilityAware>
            {formatAmount(
              fromChainAmount(singleCoin.amount, singleCoin.decimals),
              { precision: 'high', ticker: singleCoin.ticker }
            )}
          </BalanceVisibilityAware>
        ) : coins.length > 1 ? (
          <BalanceVisibilityAware>
            <>
              {coins.length} {t('assets')}
            </>
          </BalanceVisibilityAware>
        ) : null}
      </Text>
    </>
  )
}

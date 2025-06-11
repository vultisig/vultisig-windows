import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinAmount, CoinKey } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { EntityWithLogo } from '@lib/utils/entities/EntityWithLogo'
import { EntityWithPrice } from '@lib/utils/entities/EntityWithPrice'
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'

export const VaultChainCoinItem = ({
  value,
}: ValueProp<
  Partial<EntityWithLogo> &
    EntityWithTicker &
    CoinAmount &
    Partial<EntityWithPrice> &
    CoinKey
>) => {
  const { ticker, amount, decimals, price } = value
  const fiatCurrency = useFiatCurrency()
  const balance = fromChainAmount(amount, decimals)

  return (
    <HStack fullWidth alignItems="center" gap={12}>
      <CoinIcon coin={value} style={{ fontSize: 32 }} />
      <VStack fullWidth gap={8}>
        <HStack fullWidth justifyContent="space-between" alignItems="center">
          <Text color="contrast" size={20} weight="500">
            {ticker}
          </Text>
          <Text color="contrast" size={18} weight="700" centerVertically>
            <BalanceVisibilityAware>
              {formatAmount(balance * (price || 0), fiatCurrency)}
            </BalanceVisibilityAware>
          </Text>
        </HStack>
        <Text color="contrast" size={18} weight="500" centerVertically>
          <BalanceVisibilityAware>
            {formatTokenAmount(balance)}
          </BalanceVisibilityAware>
        </Text>
      </VStack>
    </HStack>
  )
}

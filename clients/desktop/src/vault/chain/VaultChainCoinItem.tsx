import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinAmount, CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { ChainCoinIcon } from '@core/ui/chain/coin/icon/ChainCoinIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '@core/ui/chain/coin/icon/utils/shouldDisplayChainLogo'
import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { EntityWithLogo } from '@lib/utils/entities/EntityWithLogo'
import { EntityWithPrice } from '@lib/utils/entities/EntityWithPrice'
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'

import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware'

export const VaultChainCoinItem = ({
  value,
}: ValueProp<
  EntityWithLogo &
    EntityWithTicker &
    CoinAmount &
    Partial<EntityWithPrice> &
    CoinKey
>) => {
  const { logo, ticker, amount, decimals, price, id, chain } = value
  const fiatCurrency = useFiatCurrency()
  const balance = fromChainAmount(amount, decimals)

  return (
    <HStack fullWidth alignItems="center" gap={12}>
      <ChainCoinIcon
        coinSrc={getCoinLogoSrc(logo)}
        chainSrc={
          shouldDisplayChainLogo({
            ticker,
            chain,
            isNative: isFeeCoin({ id, chain }),
          })
            ? getChainEntityIconSrc(chain)
            : undefined
        }
        style={{ fontSize: 32 }}
      />
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

import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text, text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'

const Container = styled.div`
  ${text({
    color: 'shy',
    weight: '700',
    size: 12,
    centerVertically: {
      gap: 8,
    },
  })}
`

export const CoinBalance = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()
  const coin = useCurrentVaultCoin(value)
  const query = useBalanceQuery(extractAccountCoinKey(coin))
  const priceQuery = useCoinPriceQuery({
    coin,
  })
  const { decimals } = coin

  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Container>
      <MatchQuery
        value={query}
        pending={() => <Spinner />}
        error={() => t('failed_to_load')}
        success={amount => (
          <BalancesWrapper gap={2}>
            <Text size={14} color="shyExtra" weight={500}>
              {t('balance')}:{' '}
              {formatAmount(fromChainAmount(amount, coin.decimals), coin)}
            </Text>
            <MatchQuery
              value={priceQuery}
              pending={() => <Skeleton />}
              success={price => (
                <Text as="span" size={12} color="shy" weight={500}>
                  {formatFiatAmount(fromChainAmount(amount, decimals) * price)}
                </Text>
              )}
            />
          </BalancesWrapper>
        )}
      />
    </Container>
  )
}

const BalancesWrapper = styled(VStack)`
  text-align: right;
`

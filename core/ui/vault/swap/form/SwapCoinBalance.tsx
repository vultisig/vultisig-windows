import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text, text } from '@lib/ui/text'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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

export const SwapCoinBalance = ({ value }: ValueProp<CoinKey>) => {
  const { t } = useTranslation()
  const coin = useCurrentVaultCoin(value)
  const query = useBalanceQuery(extractAccountCoinKey(coin))

  return (
    <Container>
      <MatchQuery
        value={query}
        pending={() => <Spinner />}
        error={() => t('failed_to_load')}
        success={amount => (
          <Text size={12} color="shy" weight={500}>
            {formatTokenAmount(fromChainAmount(amount, coin.decimals))}
            {` ${coin.ticker}`}
          </Text>
        )}
      />
    </Container>
  )
}

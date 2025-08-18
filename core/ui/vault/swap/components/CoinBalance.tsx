import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text, text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useFromAmount } from '../state/fromAmount'
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
  const [, setFromValue] = useFromAmount()

  return (
    <Container>
      <MatchQuery
        value={query}
        pending={() => <Spinner />}
        error={() => t('failed_to_load')}
        success={amount => (
          <UnstyledButton
            onClick={() => setFromValue(fromChainAmount(amount, coin.decimals))}
          >
            <Text as="span" size={12} color="shy" weight={500}>
              {formatAmount(
                fromChainAmount(amount, coin.decimals),
                coin.ticker
              )}
            </Text>
          </UnstyledButton>
        )}
      />
    </Container>
  )
}

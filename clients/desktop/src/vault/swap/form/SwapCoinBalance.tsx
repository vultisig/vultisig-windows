import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useBalanceQuery } from '../../../coin/query/useBalanceQuery'
import { Spinner } from '../../../lib/ui/loaders/Spinner'
import { ValueProp } from '../../../lib/ui/props'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { text } from '../../../lib/ui/text'
import { useCurrentVaultCoin } from '../../state/currentVault'

const Container = styled.div`
  ${text({
    color: 'supporting',
    weight: '700',
    size: 14,
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
      <span>{t('balance')}:</span>
      <span>
        <MatchQuery
          value={query}
          pending={() => <Spinner />}
          error={() => t('failed_to_load')}
          success={amount => (
            <span>
              {formatTokenAmount(fromChainAmount(amount, coin.decimals))}
            </span>
          )}
        />
      </span>
    </Container>
  )
}

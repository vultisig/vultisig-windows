import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Spinner } from '@lib/ui/loaders/Spinner'
import {
  MatchQuery,
  MatchQueryWrapperProps,
} from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../../coin/query/useBalanceQuery'
import { useCurrentSendCoin } from '../../state/sendCoin'

export const SendCoinBalanceDependant: React.FC<
  MatchQueryWrapperProps<bigint>
> = props => {
  const [coinKey] = useCurrentSendCoin()
  const coin = useCurrentVaultCoin(coinKey)

  const query = useBalanceQuery(extractAccountCoinKey(coin))

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner />}
      error={() => t('failed_to_load')}
      {...props}
    />
  )
}

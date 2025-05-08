import {
  AccountCoin,
  extractAccountCoinKey,
} from '@core/chain/coin/AccountCoin'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { Spinner } from '@lib/ui/loaders/Spinner'
import {
  MatchQuery,
  MatchQueryWrapperProps,
} from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

export const SwapCoinBalanceDependant: React.FC<
  MatchQueryWrapperProps<bigint> & { coin: AccountCoin }
> = props => {
  const query = useBalanceQuery(extractAccountCoinKey(props.coin))

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

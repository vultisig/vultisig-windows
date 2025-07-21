import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Spinner } from '@lib/ui/loaders/Spinner'
import {
  MatchQuery,
  MatchQueryProps,
} from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../../chain/coin/queries/useBalanceQuery'
import { useCurrentSendCoin } from '../../state/sendCoin'

export const SendCoinBalanceDependant: React.FC<
  Omit<MatchQueryProps<bigint>, 'value'>
> = props => {
  const coin = useCurrentSendCoin()

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

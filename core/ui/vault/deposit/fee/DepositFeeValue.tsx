import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery'

export const DepositFeeValue = () => {
  const [coin] = useDepositCoin()
  const query = useDepositChainSpecificQuery(coin)
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner />}
      error={() => t('failed_to_load')}
      success={chainSpecific => (
        <>{formatFee({ chain: coin.chain, chainSpecific })}</>
      )}
    />
  )
}

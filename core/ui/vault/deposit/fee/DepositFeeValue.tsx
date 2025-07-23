import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { t } from 'i18next'

import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery'

export const DepositFeeValue = () => {
  const query = useDepositChainSpecificQuery()
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner />}
      error={() => t('failed_to_load')}
      success={chainSpecific => (
        <>{formatFee({ chain: coinKey.chain, chainSpecific })}</>
      )}
    />
  )
}

import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatAmount } from '@lib/utils/formatAmount'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { useTxHash } from '../../../../chain/state/txHash'
import { useTxFeeQuery } from '../../../../chain/tx/queries/txFee'
import { useKeysignMessagePayload } from '../../state/keysignMessagePayload'
import { KeysignEstimatedFee } from './KeysignEstimatedTxFee'
import { TxFeeRow } from './TxFeeRow'

export const KeysignTxFee = () => {
  const payload = useKeysignMessagePayload()
  const chain = getKeysignChain(getRecordUnionValue(payload, 'keysign'))

  const txHash = useTxHash()
  const query = useTxFeeQuery({ txHash, chain })
  const { t } = useTranslation()

  const { ticker, decimals } = chainFeeCoin[chain]

  return (
    <MatchQuery
      value={query}
      error={() => <KeysignEstimatedFee />}
      pending={() => (
        <TxFeeRow label={t('network_fee')}>
          <Spinner />
        </TxFeeRow>
      )}
      success={actualFee => (
        <TxFeeRow label={t('network_fee')}>
          {formatAmount(fromChainAmount(actualFee, decimals), { ticker })}
        </TxFeeRow>
      )}
    />
  )
}

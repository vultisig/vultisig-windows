import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { useTxHash } from '../../../../chain/state/txHash'
import { useTxFeeQuery } from '../../../../chain/tx/queries/txFee'
import { useKeysignMessagePayload } from '../../state/keysignMessagePayload'
import { KeysignEstimatedFee } from './KeysignEstimatedTxFee'
import { TxFeeRow } from './TxFeeRow'

export const KeysignTxFee = () => {
  const payload = useKeysignMessagePayload()
  const { coin: potentialCoin } = getRecordUnionValue(payload, 'keysign')
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const { chain, decimals, ticker } = shouldBePresent(coin)

  const txHash = useTxHash()
  const query = useTxFeeQuery({ txHash, chain })
  const { t } = useTranslation()

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
          {formatTokenAmount(
            fromChainAmount(BigInt(actualFee), decimals),
            ticker
          )}
        </TxFeeRow>
      )}
    />
  )
}

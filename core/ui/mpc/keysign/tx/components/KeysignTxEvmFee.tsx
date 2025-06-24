import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { EvmChain } from '@core/chain/Chain'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { useEvmFeeQuery } from '../queries/useEvmFeeQuery'
import { TxFeeRow } from './TxFeeRow'

type KeysignTxEvmFeeProps = {
  txHash: string
  chain: EvmChain
  ticker: string
  decimals: number
  estimatedFee: string | null
}

export const KeysignTxEvmFee = ({
  txHash,
  chain,
  ticker,
  decimals,
  estimatedFee,
}: KeysignTxEvmFeeProps) => {
  const query = useEvmFeeQuery({ txHash, chain })
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      error={() => (
        <TxFeeRow label={t('est_network_fee')} value={estimatedFee} error />
      )}
      pending={() => <TxFeeRow label={t('network_fee')} spinner />}
      success={actualFee => (
        <TxFeeRow
          label={t('network_fee')}
          value={`${fromChainAmount(BigInt(actualFee), decimals)} ${ticker}`}
        />
      )}
    />
  )
}

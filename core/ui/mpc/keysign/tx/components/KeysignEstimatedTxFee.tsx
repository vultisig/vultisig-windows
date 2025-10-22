import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/feeQuote/getFeeAmount'
import { extractFeeQuote } from '@core/mpc/keysign/chainSpecific/extract'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { formatAmount } from '@lib/utils/formatAmount'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useKeysignMessagePayload } from '../../state/keysignMessagePayload'
import { TxFeeRow } from './TxFeeRow'

export const KeysignEstimatedFee = () => {
  const { t } = useTranslation()
  const payload = getRecordUnionValue(useKeysignMessagePayload(), 'keysign')
  const { blockchainSpecific } = payload
  const chain = getKeysignChain(payload)

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) {
      throw new Error('Invalid blockchainSpecific in keysign payload')
    }

    const quote = extractFeeQuote(blockchainSpecific)

    const { decimals, ticker } = chainFeeCoin[chain]
    const fee = fromChainAmount(getFeeAmount(chain, quote), decimals)
    return formatAmount(fee, { ticker })
  }, [blockchainSpecific, chain])

  return (
    <TxFeeRow label={t('est_network_fee')}>{networkFeesFormatted}</TxFeeRow>
  )
}

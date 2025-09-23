import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
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

    return formatFee({
      chain,
      amount: getFeeAmount(blockchainSpecific),
    })
  }, [blockchainSpecific, chain])

  return (
    <TxFeeRow label={t('est_network_fee')}>{networkFeesFormatted}</TxFeeRow>
  )
}

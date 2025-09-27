import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useKeysignMessagePayload } from '../../state/keysignMessagePayload'
import { useKeysignUtxoInfo } from '../../utxo/queries/keysignUtxoInfo'
import { TxFeeRow } from './TxFeeRow'

export const KeysignEstimatedFee = () => {
  const { t } = useTranslation()
  const payload = getRecordUnionValue(useKeysignMessagePayload(), 'keysign')
  const { blockchainSpecific } = payload
  const chain = getKeysignChain(payload)
  const { data: utxoInfo } = useKeysignUtxoInfo({
    chain,
    address: shouldBePresent(payload.coin).address,
  })
  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) {
      throw new Error('Invalid blockchainSpecific in keysign payload')
    }

    return formatFee({
      chain,
      amount: getFeeAmount({
        chainSpecific: blockchainSpecific as KeysignChainSpecific,
        utxoInfo,
        amount: payload.toAmount ? BigInt(payload.toAmount) : null,
        chain: chain,
      }),
    })
  }, [blockchainSpecific, chain, utxoInfo, payload.toAmount])

  return (
    <TxFeeRow label={t('est_network_fee')}>{networkFeesFormatted}</TxFeeRow>
  )
}

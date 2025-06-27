import { Chain } from '@core/chain/Chain'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useKeysignMessagePayload } from '../../state/keysignMessagePayload'
import { TxFeeRow } from './TxFeeRow'

export const KeysignEstimatedFee = () => {
  const { t } = useTranslation()
  const payload = useKeysignMessagePayload()
  const { blockchainSpecific, coin: potentialCoin } = getRecordUnionValue(
    payload,
    'keysign'
  )
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const { chain } = shouldBePresent(coin)

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) {
      throw new Error('Invalid blockchainSpecific in keysign payload')
    }

    return formatFee({
      chain: chain as Chain,
      chainSpecific: blockchainSpecific,
    })
  }, [blockchainSpecific, chain])

  return (
    <TxFeeRow label={t('est_network_fee')}>{networkFeesFormatted}</TxFeeRow>
  )
}

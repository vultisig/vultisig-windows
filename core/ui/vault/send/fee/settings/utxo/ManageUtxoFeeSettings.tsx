import { UtxoChain } from '@core/chain/Chain'
import { useUtxoByteFeeQuery } from '@core/ui/chain/utxo/queries/byteFee'
import { OnCloseProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FailedQueryOverlay } from '@lib/ui/query/components/overlay/FailedQueryOverlay'
import { PendingQueryOverlay } from '@lib/ui/query/components/overlay/PendingQueryOverlay'
import { StrictText } from '@lib/ui/text'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { UtxoFeeSettingsForm } from './UtxoFeeSettingsForm'

type ManageUtxoFeeSettingsProps = OnCloseProp & {
  chain: UtxoChain
}

export const ManageUtxoFeeSettings: React.FC<ManageUtxoFeeSettingsProps> = ({
  onClose,
  chain,
}) => {
  const { t } = useTranslation()
  const byteFeeQuery = useUtxoByteFeeQuery(chain)

  return (
    <MatchQuery
      value={byteFeeQuery}
      success={byteFee => (
        <UtxoFeeSettingsForm byteFee={byteFee} onClose={onClose} />
      )}
      pending={() => (
        <PendingQueryOverlay
          onClose={onClose}
          title={<StrictText>{t('loading')}</StrictText>}
        />
      )}
      error={() => (
        <FailedQueryOverlay
          title={<StrictText>{t('failed_to_load')}</StrictText>}
          onClose={onClose}
          closeText={t('close')}
        />
      )}
    />
  )
}

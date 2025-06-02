import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp, OnFinishProp, ValueProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeerOptionsQuery } from '../devices/queries/useMpcPeerOptionsQuery'
import { ServerFeedback } from './ServerFeedback'

export const WaitForServerStep = ({
  onFinish,
  onBack,
  value: keygenType,
}: OnFinishProp<string[]> & OnBackProp & Partial<ValueProp<KeygenType>>) => {
  const peersQuery = useMpcPeerOptionsQuery()
  const { t } = useTranslation()
  useEffect(() => {
    if (peersQuery.data) {
      if (keygenType && keygenType === 'plugin' && peersQuery.data.length > 3) {
        onFinish(peersQuery.data)
      } else if (!keygenType || keygenType != 'plugin') {
        onFinish(peersQuery.data)
      }
    }
  }, [peersQuery.data, onFinish, keygenType])

  return (
    <>
      <FlowPageHeader onBack={onBack} title={t('connecting_to_server')} />
      <ServerFeedback value={peersQuery} />
    </>
  )
}

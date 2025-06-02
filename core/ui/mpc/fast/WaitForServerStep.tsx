import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp, OnFinishProp, ValueProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeerOptionsQuery } from '../devices/queries/useMpcPeerOptionsQuery'
import { useCurrentKeygenType } from '../keygen/state/currentKeygenType'
import { ServerFeedback } from './ServerFeedback'

export const WaitForServerStep = ({
  onFinish,
  onBack,
}: OnFinishProp<string[]> & OnBackProp & Partial<ValueProp<KeygenType>>) => {
  const peersQuery = useMpcPeerOptionsQuery()
  const keygenType = useCurrentKeygenType()
  const { t } = useTranslation()
  useEffect(() => {
    if (peersQuery.data) {
      if (keygenType === 'plugin' && peersQuery.data.length > 3) {
        onFinish(peersQuery.data)
      } else if (keygenType != 'plugin') {
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

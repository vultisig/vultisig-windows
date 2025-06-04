import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp, OnFinishProp, ValueProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeerOptionsQuery } from '../devices/queries/useMpcPeerOptionsQuery'
import { useKeygenOperation } from '../keygen/state/currentKeygenOperationType'
import { pluginPeersConfig } from './config'
import { ServerFeedback } from './ServerFeedback'

export const WaitForServerStep = ({
  onFinish,
  onBack,
}: OnFinishProp<string[]> & OnBackProp & Partial<ValueProp<boolean>>) => {
  const peersQuery = useMpcPeerOptionsQuery()
  const { t } = useTranslation()
  const keygenOperation = useKeygenOperation()

  useEffect(() => {
    if (peersQuery.data) {
      const isPluginReshare =
        'reshare' in keygenOperation && keygenOperation.reshare === 'plugin'

      const shouldFinish =
        !isPluginReshare ||
        peersQuery.data.length >= pluginPeersConfig.minimumJoinedParties

      if (shouldFinish) {
        onFinish(peersQuery.data)
      }
    }
  }, [keygenOperation, onFinish, peersQuery.data])

  return (
    <>
      <FlowPageHeader onBack={onBack} title={t('connecting_to_server')} />
      <ServerFeedback value={peersQuery} />
    </>
  )
}

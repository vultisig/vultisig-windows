import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp, OnFinishProp, ValueProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeerOptionsQuery } from '../devices/queries/useMpcPeerOptionsQuery'
import { useCurrentKeygenOperationType } from '../keygen/state/currentKeygenOperationType'
import { pluginPeersConfig } from './config'
import { ServerFeedback } from './ServerFeedback'

export const WaitForServerStep = ({
  onFinish,
  onBack,
}: OnFinishProp<string[]> & OnBackProp & Partial<ValueProp<boolean>>) => {
  const peersQuery = useMpcPeerOptionsQuery()
  const { t } = useTranslation()
  const keygenOperation = useCurrentKeygenOperationType()

  useEffect(() => {
    if (peersQuery.data) {
      const isPluginReshare =
        'reshare' in keygenOperation && keygenOperation.reshare === 'plugin'
      if (
        isPluginReshare &&
        peersQuery.data.length >= pluginPeersConfig.minimumJoinedParties
      ) {
        onFinish(peersQuery.data)
      } else if (!isPluginReshare) {
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

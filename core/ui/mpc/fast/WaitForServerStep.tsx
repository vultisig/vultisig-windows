import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp, OnFinishProp, ValueProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeerOptionsQuery } from '../devices/queries/useMpcPeerOptionsQuery'
import { pluginPeersConfig } from './config'
import { ServerFeedback } from './ServerFeedback'

export const WaitForServerStep = ({
  onFinish,
  onBack,
  value: isPluginReshare,
}: OnFinishProp<string[]> & OnBackProp & Partial<ValueProp<boolean>>) => {
  const peersQuery = useMpcPeerOptionsQuery()
  const { t } = useTranslation()

  useEffect(() => {
    if (peersQuery.data) {
      if (
        isPluginReshare &&
        peersQuery.data.length >= pluginPeersConfig.minimumJoinedParties
      ) {
        onFinish(peersQuery.data)
      } else if (!isPluginReshare) {
        onFinish(peersQuery.data)
      }
    }
  }, [peersQuery.data, onFinish, isPluginReshare])

  return (
    <>
      <FlowPageHeader onBack={onBack} title={t('connecting_to_server')} />
      <ServerFeedback value={peersQuery} />
    </>
  )
}

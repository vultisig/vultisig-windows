import { isServer } from '@core/mpc/devices/localPartyId'
import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
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
  value: keygenOperation,
}: OnFinishProp<string[]> &
  OnBackProp &
  Partial<ValueProp<KeygenOperation>>) => {
  const peersQuery = useMpcPeerOptionsQuery()
  const { t } = useTranslation()

  useEffect(() => {
    if (peersQuery.data) {
      const isPluginReshare =
        keygenOperation &&
        'reshare' in keygenOperation &&
        keygenOperation.reshare === 'plugin'

      const shouldFinish =
        !isPluginReshare ||
        peersQuery.data.length >= pluginPeersConfig.minimumJoinedParties

      if (shouldFinish) {
        const filteredDevices = isPluginReshare
          ? peersQuery.data.filter(device => !isServer(device))
          : peersQuery.data

        onFinish(filteredDevices)
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

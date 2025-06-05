import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeerOptionsQuery } from '../devices/queries/useMpcPeerOptionsQuery'
import { ServerFeedback } from './ServerFeedback'

type WaitForServerStepProps = {
  onPeersChange: (peers: string[]) => void
} & OnBackProp

export const WaitForServerStep = ({
  onPeersChange,
  onBack,
}: WaitForServerStepProps) => {
  const peersQuery = useMpcPeerOptionsQuery()
  const { t } = useTranslation()

  useEffect(() => {
    if (peersQuery.data) {
      onPeersChange(peersQuery.data)
    }
  }, [onPeersChange, peersQuery.data])

  return (
    <>
      <FlowPageHeader onBack={onBack} title={t('connecting_to_server')} />
      <ServerFeedback value={peersQuery} />
    </>
  )
}

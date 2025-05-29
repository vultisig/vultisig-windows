import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp, OnFinishProp, ValueProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeerOptionsQuery } from '../devices/queries/useMpcPeerOptionsQuery'
import { ServerFeedback } from './ServerFeedback'
import { KeygenType } from '@core/mpc/keygen/KeygenType'

export const WaitForServerStep = ({
  onFinish,
  onBack,
}: OnFinishProp<string[]> & OnBackProp & Partial<ValueProp<KeygenType>>) => {
  const peersQuery = useMpcPeerOptionsQuery()

  useEffect(() => {
    if (peersQuery.data) {
      onFinish(peersQuery.data)
    }
  }, [peersQuery.data, onFinish])

  const { t } = useTranslation()

  return (
    <>
      <FlowPageHeader onBack={onBack} title={t('connecting_to_server')} />
      <ServerFeedback value={peersQuery} />
    </>
  )
}

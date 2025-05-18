import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ServerFeedback } from '../../fast/ServerFeedback'
import { useFastKeygenServerActionMutation } from './mutations/useFastKeygenServerActionMutation'

export const FastKeygenServerActionStep = ({
  onFinish,
  onBack,
}: OnFinishProp & OnBackProp) => {
  const { mutate, ...mutationState } = useFastKeygenServerActionMutation({
    onSuccess: onFinish,
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  const { t } = useTranslation()

  const title = t('fastVaultSetup.connectingWithServer')

  return (
    <>
      <FlowPageHeader onBack={onBack} title={title} />
      <ServerFeedback value={mutationState} />
    </>
  )
}

import { useFastKeygenServerActionMutation } from '@core/ui/mpc/keygen/fast/mutations/useFastKeygenServerActionMutation'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const FastKeygenServerActionStep: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()
  const { mutate, ...mutationState } = useFastKeygenServerActionMutation({
    onSuccess: onFinish,
  })

  useEffect(() => mutate(), [mutate])

  return (
    <>
      <PageHeader title={t('fastVaultSetup.connectingWithServer')} hasBorder />
      <MatchQuery
        value={mutationState}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_connect_with_server')}
            message={extractErrorMsg(error)}
          />
        )}
        pending={() => (
          <FlowPendingPageContent
            title={`${t('connecting_to_server')}...`}
            message={t('fastVaultSetup.takeMinute')}
          />
        )}
      />
    </>
  )
}

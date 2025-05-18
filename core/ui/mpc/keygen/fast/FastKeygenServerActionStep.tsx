import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { MpcPendingMessage } from '../../status/MpcPendingMessage'
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
      <MatchQuery
        value={mutationState}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_connect_with_server')}
            message={extractErrorMsg(error)}
          />
        )}
        pending={() => (
          <>
            <PageContent justifyContent="center" alignItems="center">
              <MpcPendingMessage>{title}</MpcPendingMessage>
            </PageContent>
          </>
        )}
      />
    </>
  )
}

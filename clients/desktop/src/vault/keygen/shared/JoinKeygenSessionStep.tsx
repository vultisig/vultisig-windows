import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcLocalPartyId } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { useMpcServerUrl } from '../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../mpc/session/state/mpcSession'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { joinSession } from '../utils/joinSession'
import { KeygenNetworkReminder } from './KeygenNetworkReminder'
import { PendingKeygenMessage } from './PendingKeygenMessage'

export const JoinKeygenSessionStep = ({
  onForward,
  onBack,
}: OnForwardProp & Partial<OnBackProp>) => {
  const sessionId = useMpcSessionId()

  const serverUrl = useMpcServerUrl()

  const localPartyId = useMpcLocalPartyId()

  const { mutate: start, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      return joinSession({
        serverUrl,
        sessionId,
        localPartyId,
      })
    },
    onSuccess: onForward,
  })

  useEffect(() => start(), [start])

  const { t } = useTranslation()

  const title = t('join_session')

  return (
    <MatchQuery
      value={mutationStatus}
      success={() => null}
      error={() => (
        <FullPageFlowErrorState message={t('failed_to_join_session')} />
      )}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={<PageHeaderTitle>{title}</PageHeaderTitle>}
          />
          <PageContent data-testid="JoinKeygenStep-PageContent">
            <VStack flexGrow>
              <VStack flexGrow alignItems="center" justifyContent="center">
                <PendingKeygenMessage>
                  {t('joining_session')}
                </PendingKeygenMessage>
              </VStack>
            </VStack>
            <KeygenNetworkReminder />
          </PageContent>
        </>
      )}
    />
  )
}

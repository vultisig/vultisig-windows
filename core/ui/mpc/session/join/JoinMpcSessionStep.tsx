import { joinMpcSession } from '@core/mpc/session/joinMpcSession'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FullPageFlowErrorState } from '../../../flow/FullPageFlowErrorState'
import { MpcPendingMessage } from '../../status/MpcPendingMessage'

export const JoinMpcSessionStep = ({
  onFinish,
  onBack,
}: OnFinishProp & Partial<OnBackProp>) => {
  const sessionId = useMpcSessionId()

  const serverUrl = useMpcServerUrl()

  const localPartyId = useMpcLocalPartyId()

  const { mutate: start, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      return joinMpcSession({
        serverUrl,
        sessionId,
        localPartyId,
      })
    },
    onSuccess: onFinish,
  })

  useEffect(() => start(), [start])

  const { t } = useTranslation()

  const title = t('join_session')

  return (
    <MatchQuery
      value={mutationStatus}
      success={() => null}
      error={error => (
        <FullPageFlowErrorState
          errorMessage={extractErrorMsg(error)}
          message={t('failed_to_join_session')}
        />
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
                <MpcPendingMessage>{t('joining_session')}</MpcPendingMessage>
              </VStack>
            </VStack>
          </PageContent>
        </>
      )}
    />
  )
}

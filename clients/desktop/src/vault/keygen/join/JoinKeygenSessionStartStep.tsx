import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { OnForwardProp } from '../../../lib/ui/props'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { KeygenPageHeader } from '../shared/KeygenPageHeader'
import { PendingKeygenMessage } from '../shared/PendingKeygenMessage'
import { useSessionStartQuery } from './queries/useSessionStartQuery'

export const JoinKeygenSessionStartStep = ({ onForward }: OnForwardProp) => {
  const sessionQuery = useSessionStartQuery()

  const { t } = useTranslation()
  const title = t('join_keygen')

  useEffect(() => {
    if (sessionQuery.data) {
      onForward()
    }
  }, [sessionQuery.data, onForward])

  return (
    <MatchQuery
      error={error => (
        <FullPageFlowErrorState
          title={title}
          message={t('failed_to_join_keygen')}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      value={sessionQuery}
      pending={() => (
        <>
          <KeygenPageHeader title={title} />s{' '}
          <PageContent alignItems="center" justifyContent="center">
            <PendingKeygenMessage>
              {t('waiting_for_keygen_start')}
            </PendingKeygenMessage>
          </PageContent>
        </>
      )}
    />
  )
}

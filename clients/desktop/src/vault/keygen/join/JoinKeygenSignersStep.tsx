import { without } from '@lib/utils/array/without'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { OnFinishProp } from '../../../lib/ui/props'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { KeygenPageHeader } from '../shared/KeygenPageHeader'
import { PendingKeygenMessage } from '../shared/PendingKeygenMessage'
import { useCurrentLocalPartyId } from '../state/currentLocalPartyId'
import { useKeygenSignersQuery } from './queries/useKeygenSignersQuery'

export const JoinKeygenSignersStep = ({
  onFinish,
}: OnFinishProp<{ peers: string[] }>) => {
  const sessionQuery = useKeygenSignersQuery()

  const { t } = useTranslation()
  const title = t('join_keygen')

  const localPartyId = useCurrentLocalPartyId()

  useEffect(() => {
    const signers = sessionQuery.data

    if (signers) {
      onFinish({ peers: without(signers, localPartyId) })
    }
  }, [localPartyId, onFinish, sessionQuery.data])

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

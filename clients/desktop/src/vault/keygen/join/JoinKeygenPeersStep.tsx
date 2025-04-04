import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeersQuery } from '../../../mpc/peers/queries/useMpcPeersQuery'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { KeygenPageHeader } from '../shared/KeygenPageHeader'
import { PendingKeygenMessage } from '../shared/PendingKeygenMessage'

export const JoinKeygenPeersStep = ({ onFinish }: OnFinishProp<string[]>) => {
  const peersQuery = useMpcPeersQuery()

  const { t } = useTranslation()
  const title = t('join_keygen')

  useEffect(() => {
    const peers = peersQuery.data

    if (peers) {
      onFinish(peers)
    }
  }, [onFinish, peersQuery.data])

  return (
    <MatchQuery
      error={error => (
        <FullPageFlowErrorState
          message={t('failed_to_join_keygen')}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      value={peersQuery}
      pending={() => (
        <>
          <KeygenPageHeader title={title} />
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

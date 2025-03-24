import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcPeersQuery } from '../../../mpc/peers/queries/useMpcPeersQuery'
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage'

export const WaitForKeysignToStart = ({ onFinish }: OnFinishProp<string[]>) => {
  const peersQuery = useMpcPeersQuery()

  useEffect(() => {
    const peers = peersQuery.data

    if (peers) {
      onFinish(peers)
    }
  }, [onFinish, peersQuery.data])

  const { t } = useTranslation()

  const title = t('join_keysign')

  return (
    <MatchQuery
      error={error => (
        <FullPageFlowErrorState
          message={t('failed_to_join_keysign')}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      value={peersQuery}
      pending={() => (
        <>
          <FlowPageHeader title={title} />
          <PageContent alignItems="center" justifyContent="center">
            <PendingKeygenMessage>
              {t('waiting_for_keysign_start')}
            </PendingKeygenMessage>
          </PageContent>
        </>
      )}
    />
  )
}

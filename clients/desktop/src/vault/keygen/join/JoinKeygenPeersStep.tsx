import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { OnFinishProp } from '../../../lib/ui/props'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { JoinSecureVaultKeygen } from '../shared/JoinSecureVaultKeygen'
import { KeygenPageHeader } from '../shared/KeygenPageHeader'
import { PendingKeygenMessage } from '../shared/PendingKeygenMessage'
import { useKeygenPeersQuery } from './queries/useKeygenPeersQuery'

export const JoinKeygenPeersStep = ({ onFinish }: OnFinishProp<string[]>) => {
  const peersQuery = useKeygenPeersQuery()
  const { keygenType } = useAppPathState<'joinKeygen'>()
  const isKeygen = keygenType.toLowerCase() === 'keygen'

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
          title={title}
          message={t('failed_to_join_keygen')}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      value={peersQuery}
      pending={() =>
        isKeygen ? (
          <JoinSecureVaultKeygen />
        ) : (
          <>
            <KeygenPageHeader title={title} />
            <PageContent alignItems="center" justifyContent="center">
              <PendingKeygenMessage>
                {t('waiting_for_keygen_start')}
              </PendingKeygenMessage>
            </PageContent>
          </>
        )
      }
    />
  )
}

import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { pluginPeersConfig } from '@core/ui/mpc/fast/config'
import { KeygenPendingState } from '@core/ui/mpc/keygen/reshare/plugin/KeygenPendingState'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const WaitForServer: FC<OnFinishProp<string[]>> = ({ onFinish }) => {
  const { t } = useTranslation()
  const peersQuery = useMpcPeerOptionsQuery()

  useEffect(() => {
    if (
      peersQuery.data &&
      peersQuery.data.length >= pluginPeersConfig.minimumJoinedParties
    ) {
      onFinish(peersQuery.data)
    }
  }, [onFinish, peersQuery.data])

  return (
    <MatchQuery
      value={peersQuery}
      error={error => (
        <FlowErrorPageContent
          title={t('failed_to_connect_with_server')}
          message={extractErrorMsg(error)}
        />
      )}
      pending={() => <KeygenPendingState value={null} />}
    />
  )
}

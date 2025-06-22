import { hasServer } from '@core/mpc/devices/localPartyId'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { pluginPeersConfig } from '@core/ui/mpc/fast/config'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InstallPluginPendingState } from './InstallPluginPendingState'
import { InstallPluginStep } from './InstallPluginStep'

export const WaitForPluginAndVerifier: FC<OnFinishProp<string[]>> = ({
  onFinish,
}) => {
  const { t } = useTranslation()
  const peersQuery = useMpcPeerOptionsQuery()
  const [step, setStep] = useState<InstallPluginStep | null>(null)

  const peers = useMemo(() => peersQuery.data ?? [], [peersQuery.data])

  const hasVerifier = peers.some(p => p.startsWith('verifier'))
  const hasPlugin = peers.some(p => p.startsWith('plugin'))
  const enoughPeers = peers.length >= pluginPeersConfig.minimumJoinedParties

  // Determine current step based on joined peers
  const nextStep: InstallPluginStep | null = useMemo(() => {
    if (hasPlugin && hasVerifier) return 'install'
    if (hasVerifier) return 'pluginServer'
    return null
  }, [hasVerifier, hasPlugin])

  useEffect(() => {
    setStep(nextStep)
  }, [nextStep])

  useEffect(() => {
    if (hasPlugin && hasVerifier && enoughPeers && hasServer(peers)) {
      onFinish(peers)
    }
  }, [enoughPeers, hasPlugin, hasVerifier, peers, onFinish])

  return (
    <MatchQuery
      value={peersQuery}
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
      success={() => <InstallPluginPendingState value={step} />}
    />
  )
}

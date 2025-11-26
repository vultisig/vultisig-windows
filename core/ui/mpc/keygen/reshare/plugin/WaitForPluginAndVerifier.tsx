import { hasServer } from '@core/mpc/devices/localPartyId'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { pluginPeersConfig } from '@core/ui/mpc/fast/config'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { InstallPluginStep } from './InstallPluginStep'
import { usePluginInstallAnimation } from './PluginInstallAnimationProvider'

const pluginIdPattern = /^[^-]+-[^-]+-[0-9a-f]{4}-[0-9]+$/

const getNextStep = (
  hasServer: boolean,
  hasVerifier: boolean,
  hasPlugin: boolean
): InstallPluginStep | null => {
  if (!hasServer) return 'fastServer'

  const state = `${hasVerifier}-${hasPlugin}` as const
  const stepMap: Record<string, InstallPluginStep | null> = {
    'false-false': 'verifierServer',
    'false-true': 'verifierServer',
    'true-false': 'pluginServer',
    'true-true': 'install',
  }
  return stepMap[state] ?? null
}

export const WaitForPluginAndVerifier: FC<OnFinishProp<string[]>> = ({
  onFinish,
}) => {
  const { t } = useTranslation()
  const peersQuery = useMpcPeerOptionsQuery()
  const animationContext = usePluginInstallAnimation()

  const peers = useMemo(() => peersQuery.data ?? [], [peersQuery.data])

  const hasVerifier = peers.some(p => p.startsWith('verifier'))
  const hasPlugin = peers.some(p => pluginIdPattern.test(p))
  const enoughPeers = peers.length >= pluginPeersConfig.minimumJoinedParties
  const serverPresent = hasServer(peers)

  const nextStep: InstallPluginStep | null = useMemo(
    () => getNextStep(serverPresent, hasVerifier, hasPlugin),
    [serverPresent, hasVerifier, hasPlugin]
  )

  useEffect(() => {
    if (animationContext) {
      animationContext.setCurrentStep(nextStep)
    }
  }, [nextStep, animationContext])

  useEffect(() => {
    if (hasPlugin && hasVerifier && enoughPeers && serverPresent) {
      onFinish(peers)
    }
  }, [enoughPeers, hasPlugin, hasVerifier, peers, onFinish, serverPresent])

  return (
    <MatchQuery
      value={peersQuery}
      error={error => (
        <FlowErrorPageContent
          title={t('failed_to_connect_with_server')}
          error={error}
        />
      )}
    />
  )
}

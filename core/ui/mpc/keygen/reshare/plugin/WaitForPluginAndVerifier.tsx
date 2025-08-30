import { hasServer } from '@core/mpc/devices/localPartyId'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { pluginPeersConfig } from '@core/ui/mpc/fast/config'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../../../flow/FlowErrorPageContent'
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
  // Detect if there is at least one plugin in the peers list
  // Plugin local party format is expected to be: {developer}-{plugin}-{collision prevention random hex}-{random number}
  // Example: vultisig-payroll-0000-1234 or raghav-personal-4567-13332
  const pluginIdPattern = /^[^-]+-[^-]+-[0-9a-f]{4}-[0-9]+$/ // {dev}-{plugin}-{4hex}-{n}
  const hasPlugin = peers.some(p => pluginIdPattern.test(p))
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
          error={error}
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

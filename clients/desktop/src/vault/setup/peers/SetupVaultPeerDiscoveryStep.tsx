import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { OnBackProp, OnForwardProp } from '../../../lib/ui/props'
import { useCurrentLocalPartyId } from '../../keygen/state/currentLocalPartyId'
import { useSelectedPeers } from '../../keysign/shared/state/selectedPeers'
import { SecureVaultKeygenPeerDiscoveryStep } from '../secure/SecureVaultKeygenPeerDiscoveryStep'
import { useJoinKeygenUrlQuery } from './queries/useJoinKeygenUrlQuery'

const requiredPeers = 1

export const SetupVaultPeerDiscoveryStep: React.FC<
  OnForwardProp & OnBackProp
> = ({ onForward, onBack }) => {
  const { t } = useTranslation()
  const peers = useSelectedPeers()
  const currentDevice = useCurrentLocalPartyId()

  const isDisabled = useMemo(() => {
    if (peers.length < requiredPeers) {
      return t('select_n_devices', { count: requiredPeers })
    }
  }, [peers.length, t])

  const joinUrlQuery = useJoinKeygenUrlQuery()

  return (
    <SecureVaultKeygenPeerDiscoveryStep
      currentDevice={currentDevice}
      onBack={onBack}
      onForward={onForward}
      isDisabled={isDisabled}
      joinUrlQuery={joinUrlQuery}
    />
  )
}

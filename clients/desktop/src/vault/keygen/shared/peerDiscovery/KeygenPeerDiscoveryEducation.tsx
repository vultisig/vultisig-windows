import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { useBoolean } from '@lib/ui/hooks/useBoolean'

import { SecureVaultKeygenOverlay } from '../../../setup/secure/components/SecureVaultKeygenOverlay'

export const KeygenPeerDiscoveryEducation = () => {
  const [shouldShowOverlay, { unset: closeOverlay }] = useBoolean(true)

  const keygenType = useCurrentKeygenType()

  if (keygenType === 'create' && shouldShowOverlay) {
    return <SecureVaultKeygenOverlay onCompleted={closeOverlay} />
  }

  return null
}

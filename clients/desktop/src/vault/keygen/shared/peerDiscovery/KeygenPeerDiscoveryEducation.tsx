import { KeygenType } from '@core/mpc/keygen/KeygenType'

import { useBoolean } from '../../../../lib/ui/hooks/useBoolean'
import { SecureVaultKeygenOverlay } from '../../../setup/secure/components/SecureVaultKeygenOverlay'
import { useCurrentKeygenType } from '../../state/currentKeygenType'

export const KeygenPeerDiscoveryEducation = () => {
  const [shouldShowOverlay, { unset: closeOverlay }] = useBoolean(true)

  const keygenType = useCurrentKeygenType()

  if (keygenType === KeygenType.Keygen && shouldShowOverlay) {
    return <SecureVaultKeygenOverlay onCompleted={closeOverlay} />
  }

  return null
}

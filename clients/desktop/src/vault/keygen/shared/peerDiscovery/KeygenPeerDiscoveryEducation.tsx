import { useBoolean } from '../../../../lib/ui/hooks/useBoolean'
import { SecureVaultKeygenOverlay } from '../../../setup/secure/components/SecureVaultKeygenOverlay'
import { KeygenType } from '../../KeygenType'
import { useCurrentKeygenType } from '../../state/currentKeygenType'

export const KeygenPeerDiscoveryEducation = () => {
  const [overlayShown, { unset: closeOverlay }] = useBoolean(false)

  const [keygenType] = useCurrentKeygenType()

  if (keygenType === KeygenType.Keygen && !overlayShown) {
    return <SecureVaultKeygenOverlay onCompleted={closeOverlay} />
  }

  return null
}

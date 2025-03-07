import { useState } from 'react'

import { SecureVaultKeygenOverlay } from '../../../setup/secure/components/SecureVaultKeygenOverlay'
import { KeygenType } from '../../KeygenType'
import { useCurrentKeygenType } from '../../state/currentKeygenType'

export const KeygenPeerDiscoveryEducation = () => {
  const [overlayShown, setHasShownOverlay] = useState(true)

  const [keygenType] = useCurrentKeygenType()

  if (keygenType === KeygenType.Keygen && !overlayShown) {
    return (
      <SecureVaultKeygenOverlay onCompleted={() => setHasShownOverlay(false)} />
    )
  }

  return null
}

import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { useBoolean } from '@lib/ui/hooks/useBoolean'

import { KeygenPeerDiscoveryEducationOverlay } from './KeygenPeerDiscoveryEducationOverlay'

export const KeygenPeerDiscoveryEducation = () => {
  const [shouldShowOverlay, { unset: closeOverlay }] = useBoolean(true)

  const keygenType = useCurrentKeygenType()

  if (keygenType === 'create' && shouldShowOverlay) {
    return <KeygenPeerDiscoveryEducationOverlay onFinish={closeOverlay} />
  }

  return null
}

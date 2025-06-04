import { useCurrentKeygenOperationType } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useBoolean } from '@lib/ui/hooks/useBoolean'

import { KeygenPeerDiscoveryEducationOverlay } from './KeygenPeerDiscoveryEducationOverlay'

export const KeygenPeerDiscoveryEducation = () => {
  const [shouldShowOverlay, { unset: closeOverlay }] = useBoolean(true)

  const operationType = useCurrentKeygenOperationType()

  if ('create' in operationType && shouldShowOverlay) {
    return <KeygenPeerDiscoveryEducationOverlay onFinish={closeOverlay} />
  }

  return null
}

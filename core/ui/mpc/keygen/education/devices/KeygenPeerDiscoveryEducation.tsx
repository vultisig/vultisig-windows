import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useBoolean } from '@lib/ui/hooks/useBoolean'

import { KeygenPeerDiscoveryEducationOverlay } from './KeygenPeerDiscoveryEducationOverlay'

export const KeygenPeerDiscoveryEducation = () => {
  const [shouldShowOverlay, { unset: closeOverlay }] = useBoolean(true)

  const keygenOperation = useKeygenOperation()

  if ('create' in keygenOperation && shouldShowOverlay) {
    return <KeygenPeerDiscoveryEducationOverlay onFinish={closeOverlay} />
  }

  return null
}

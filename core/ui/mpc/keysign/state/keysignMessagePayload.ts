import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'

export const [KeysignMessagePayloadProvider, useKeysignMessagePayload] =
  setupValueProvider<KeysignMessagePayload>('KeysignMessagePayload')

import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [KeysignMessagePayloadProvider, useKeysignMessagePayload] =
  setupValueProvider<KeysignMessagePayload>('KeysignMessagePayload')

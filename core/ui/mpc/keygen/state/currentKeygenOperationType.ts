import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [KeygenOperationProvider, useKeygenOperation] =
  setupValueProvider<KeygenOperation>('KeygenOperation')

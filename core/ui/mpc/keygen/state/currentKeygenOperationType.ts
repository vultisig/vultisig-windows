import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { KeygenOperation } from '@vultisig/core-mpc/keygen/KeygenOperation'

export const [KeygenOperationProvider, useKeygenOperation] =
  setupValueProvider<KeygenOperation>('KeygenOperation')

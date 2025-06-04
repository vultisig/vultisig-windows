import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useKeygenOperation,
  provider: KeygenOperationProvider,
} = getValueProviderSetup<KeygenOperation>('KeygenOperation')

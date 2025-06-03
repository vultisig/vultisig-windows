import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useCurrentKeygenOperationType,
  provider: CurrentKeygenOperationTypeProvider,
} = getValueProviderSetup<KeygenOperation>('CurrentKeygenOperationType')

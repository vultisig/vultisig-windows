import { KeygenType } from '@core/mpc/keygen/KeygenType'

import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup'

export const {
  useValue: useCurrentKeygenType,
  provider: CurrentKeygenTypeProvider,
} = getValueProviderSetup<KeygenType>('CurrentKeygenType')

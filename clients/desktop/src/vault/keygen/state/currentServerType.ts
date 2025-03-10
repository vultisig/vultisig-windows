import { KeygenServerType } from '@core/keygen/server/KeygenServerType'

import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup'

export const {
  useState: useCurrentServerType,
  provider: CurrentServerTypeProvider,
} = getStateProviderSetup<KeygenServerType>('CurrentServerType')

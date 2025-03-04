import { MpcServerType } from '@core/mpc/MpcServerType'

import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup'

export const {
  useState: useCurrentServerType,
  provider: CurrentServerTypeProvider,
} = getStateProviderSetup<MpcServerType>('CurrentServerType')

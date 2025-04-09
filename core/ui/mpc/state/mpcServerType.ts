import { getStateProviderSetup } from '@clients/desktop/src/lib/ui/state/getStateProviderSetup'
import { MpcServerType } from '@core/mpc/MpcServerType'

export const { useState: useMpcServerType, provider: MpcServerTypeProvider } =
  getStateProviderSetup<MpcServerType>('MpcServerType')

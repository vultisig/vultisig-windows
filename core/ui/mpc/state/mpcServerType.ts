import { MpcServerType } from '@core/mpc/MpcServerType'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useMpcServerType, provider: MpcServerTypeProvider } =
  getStateProviderSetup<MpcServerType>('MpcServerType')

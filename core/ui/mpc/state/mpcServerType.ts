import { MpcServerType } from '@core/mpc/MpcServerType'
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [MpcServerTypeProvider, useMpcServerType] =
  setupStateProvider<MpcServerType>('MpcServerType')

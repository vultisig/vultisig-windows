import { setupStateProvider } from '@lib/ui/state/setupStateProvider'
import { MpcServerType } from '@vultisig/core-mpc/MpcServerType'

export const [MpcServerTypeProvider, useMpcServerType] =
  setupStateProvider<MpcServerType>('MpcServerType')

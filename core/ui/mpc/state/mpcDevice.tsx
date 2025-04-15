import { MpcDevice } from '@core/mpc/devices/MpcDevice'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { useValue: useMpcDevice, provider: MpcDeviceProvider } =
  getValueProviderSetup<MpcDevice>('MpcDevice')

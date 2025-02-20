import { getValueProviderSetup } from '../../lib/ui/state/getValueProviderSetup'

export const {
  useValue: useIsInitiatingDevice,
  provider: IsInitiatingDeviceProvider,
} = getValueProviderSetup<boolean>('IsInitiatingDevice')

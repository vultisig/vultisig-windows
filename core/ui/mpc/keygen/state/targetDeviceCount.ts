import { getOptionalValueProviderSetup } from '@lib/ui/state/getOptionalValueProviderSetup'

export const {
  useValue: useTargetDeviceCount,
  provider: TargetDeviceCountProvider,
} = getOptionalValueProviderSetup<number>()

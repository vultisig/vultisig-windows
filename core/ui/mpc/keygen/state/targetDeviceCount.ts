import { setupOptionalValueProvider } from '@lib/ui/state/setupOptionalValueProvider'

export const [TargetDeviceCountProvider, useTargetDeviceCount] =
  setupOptionalValueProvider<number>()

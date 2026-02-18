import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [IsInitiatingDeviceProvider, useIsInitiatingDevice] =
  setupValueProvider<boolean>('IsInitiatingDevice')

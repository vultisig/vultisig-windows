import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [MpcServerUrlProvider, useMpcServerUrl] =
  setupValueProvider<string>('MpcServerUrl')

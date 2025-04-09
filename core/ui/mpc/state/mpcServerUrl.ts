import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { useValue: useMpcServerUrl, provider: MpcServerUrlProvider } =
  getValueProviderSetup<string>('MpcServerUrl')

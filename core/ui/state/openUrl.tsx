import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { useValue: useOpenUrl, provider: OpenUrlProvider } =
  getValueProviderSetup<(url: string) => void>('OpenUrl')

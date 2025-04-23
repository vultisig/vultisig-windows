import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { provider: VersionProvider, useValue: useVersion } =
  getValueProviderSetup<string>('version')

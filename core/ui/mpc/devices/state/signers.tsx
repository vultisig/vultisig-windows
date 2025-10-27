import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { useValue: useMpcSigners, provider: MpcSignersProvider } =
  getValueProviderSetup<string[]>('MpcSigners')

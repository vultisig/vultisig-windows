import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { useValue: useMpcPeers, provider: MpcPeersProvider } =
  getValueProviderSetup<string[]>('MpcPeers')

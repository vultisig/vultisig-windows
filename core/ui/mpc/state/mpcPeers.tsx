import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [MpcPeersProvider, useMpcPeers] =
  setupValueProvider<string[]>('MpcPeers')

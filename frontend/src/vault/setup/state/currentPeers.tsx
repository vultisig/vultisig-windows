import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';

export const { useState: useCurrentPeers, provider: CurrentPeersProvider } =
  getStateProviderSetup<string[]>('CurrentPeers');

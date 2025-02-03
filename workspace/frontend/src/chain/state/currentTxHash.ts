import { getValueProviderSetup } from '../../lib/ui/state/getValueProviderSetup';

export const { useValue: useCurrentTxHash, provider: CurrentTxHashProvider } =
  getValueProviderSetup<string>('CurrentTxHash');

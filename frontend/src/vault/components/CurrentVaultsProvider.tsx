import { storage } from '../../../wailsjs/go/models';
import { getValueProviderSetup } from '../../lib/ui/state/getValueProviderSetup';

export const { useValue: useCurrentVaults, provider: CurrentVaultsProvider } =
  getValueProviderSetup<storage.Vault[]>('Vaults');

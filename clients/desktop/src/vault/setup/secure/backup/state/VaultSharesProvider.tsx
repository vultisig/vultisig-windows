import { storage } from '../../../../../../wailsjs/go/models';
import { getStateProviderSetup } from '../../../../../lib/ui/state/getStateProviderSetup';

export const { useState: useVaultShares, provider: VaultSharesProvider } =
  getStateProviderSetup<storage.KeyShare[]>('VaultShares');

import { storage } from '../../../wailsjs/go/models';
import { getStateProviderSetup } from '../../lib/ui/state/getStateProviderSetup';

export const { useState: useCurrentVault, provider: CurrentVaultProvider } =
  getStateProviderSetup<storage.Vault>('Vault');

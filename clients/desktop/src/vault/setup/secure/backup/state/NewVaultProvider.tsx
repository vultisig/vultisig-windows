import { storage } from '../../../../../../wailsjs/go/models';
import { getStateProviderSetup } from '../../../../../lib/ui/state/getStateProviderSetup';

export const { useState: useNewVault, provider: NewVaultProvider } =
  getStateProviderSetup<storage.Vault>('NewVault');

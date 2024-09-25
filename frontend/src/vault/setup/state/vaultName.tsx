import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';

export const { useState: useVaultName, provider: VaultNameProvider } =
  getStateProviderSetup<string>('VaultName');

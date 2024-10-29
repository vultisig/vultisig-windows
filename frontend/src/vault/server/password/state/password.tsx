import { getStateProviderSetup } from '../../../../lib/ui/state/getStateProviderSetup';

export const { useState: useVaultPassword, provider: PasswordProvider } =
  getStateProviderSetup<string>('Password');

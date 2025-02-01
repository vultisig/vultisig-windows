import { storage } from '../../../../../wailsjs/go/models';
import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentKeysignVault,
  provider: CurrentKeysignVaultProvider,
} = getValueProviderSetup<storage.Vault>('CurrentKeysignVault');

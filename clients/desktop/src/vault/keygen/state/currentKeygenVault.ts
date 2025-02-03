import { storage } from '../../../../wailsjs/go/models';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentKeygenVault,
  provider: CurrentKeygenVaultProvider,
} = getValueProviderSetup<storage.Vault>('CurrentKeygenVault');

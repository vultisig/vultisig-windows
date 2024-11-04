import { storage } from '../../../../wailsjs/go/models';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';

export const {
  useValue: useCurrentVaultFolder,
  provider: VaultFolderProvider,
} = getValueProviderSetup<storage.VaultFolder>('VaultFolder');

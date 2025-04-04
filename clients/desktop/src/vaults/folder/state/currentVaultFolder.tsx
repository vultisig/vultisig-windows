import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { storage } from '../../../../wailsjs/go/models'

export const {
  useValue: useCurrentVaultFolder,
  provider: VaultFolderProvider,
} = getValueProviderSetup<storage.VaultFolder>('VaultFolder')

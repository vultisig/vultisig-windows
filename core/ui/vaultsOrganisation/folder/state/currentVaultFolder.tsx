import { VaultFolder } from '@core/ui/vault/VaultFolder'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useCurrentVaultFolder,
  provider: VaultFolderProvider,
} = getValueProviderSetup<VaultFolder>('VaultFolder')

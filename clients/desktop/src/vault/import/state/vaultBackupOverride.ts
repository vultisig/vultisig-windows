import { VaultBackupOverride } from '@core/ui/vault/import/VaultBackupResult'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  provider: VaultBackupOverrideProvider,
  useValue: useVaultBackupOverride,
} = getValueProviderSetup<VaultBackupOverride | null>('vaultBackupOverride')

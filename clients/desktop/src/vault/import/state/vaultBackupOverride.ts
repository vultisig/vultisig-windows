import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup'
import { VaultBackupOverride } from '../VaultBakupResult'

export const {
  provider: VaultBackupOverrideProvider,
  useValue: useVaultBackupOverride,
} = getValueProviderSetup<VaultBackupOverride | null>('vaultBackupOverride')

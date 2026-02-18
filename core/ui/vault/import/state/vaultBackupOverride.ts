import { VaultBackupOverride } from '@core/ui/vault/import/VaultBackupResult'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [VaultBackupOverrideProvider, useVaultBackupOverride] =
  setupValueProvider<VaultBackupOverride | null>('vaultBackupOverride')

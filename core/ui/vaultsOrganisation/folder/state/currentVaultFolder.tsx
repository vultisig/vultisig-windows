import { VaultFolder } from '@core/ui/vault/VaultFolder'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [VaultFolderProvider, useCurrentVaultFolder] =
  setupValueProvider<VaultFolder>('VaultFolder')

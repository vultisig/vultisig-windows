import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

export const [VaultSecurityTypeProvider, useVaultSecurityType] =
  setupValueProvider<VaultSecurityType>('VaultSecurityType')

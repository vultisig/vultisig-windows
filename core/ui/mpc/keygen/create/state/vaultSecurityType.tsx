import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useVaultSecurityType,
  provider: VaultSecurityTypeProvider,
} = getValueProviderSetup<VaultSecurityType>('VaultSecurityType')

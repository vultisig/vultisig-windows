import { Vault } from '@core/ui/vault/Vault'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { useValue: useCurrentVault, provider: CurrentVaultProvider } =
  getValueProviderSetup<Vault>('CurrentVault')

import { storage } from '../../../../../wailsjs/go/models'
import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup'

export const { provider: CurrentKeysignVaultProvider } =
  getValueProviderSetup<storage.Vault>('CurrentKeysignVault')

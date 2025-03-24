import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup'
import { SetupVaultType } from '../../type/SetupVaultType'

export const { useValue: useVaultType, provider: VaultTypeProvider } =
  getValueProviderSetup<SetupVaultType>('VaultType')

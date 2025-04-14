import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { Vault } from '@core/ui/vault/Vault'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { VaultSecurityType } from '../VaultSecurityType'

export const { useValue: useCurrentVault, provider: CurrentVaultProvider } =
  getValueProviderSetup<Vault>('CurrentVault')

export const useCurrentVaultSecurityType = (): VaultSecurityType => {
  const { signers, localPartyId } = useCurrentVault()

  return hasServer(signers) && !isServer(localPartyId) ? 'secure' : 'fast'
}

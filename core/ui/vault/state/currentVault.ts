import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { Vault } from '@core/ui/vault/Vault'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { useValue: useCurrentVault, provider: CurrentVaultProvider } =
  getValueProviderSetup<Vault>('CurrentVault')

export const useCurrentVaultSecurityType = (): VaultSecurityType => {
  const { signers, localPartyId } = useCurrentVault()

  return hasServer(signers) && !isServer(localPartyId) ? 'fast' : 'secure'
}

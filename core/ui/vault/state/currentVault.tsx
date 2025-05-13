import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { useCurrentVaultId } from '../../storage/currentVaultId'
import { useVaults } from '../../storage/vaults'

export const currentVaultContextId = 'CurrentVault'

export const { useValue: useCurrentVault, provider: CurrentVaultProvider } =
  getValueProviderSetup<Vault & Partial<{ coins: AccountCoin[] }>>(
    currentVaultContextId
  )

export const useCurrentVaultSecurityType = (): VaultSecurityType => {
  const { signers, localPartyId } = useCurrentVault()

  return hasServer(signers) && !isServer(localPartyId) ? 'fast' : 'secure'
}

export const RootCurrentVaultProvider = ({ children }: ChildrenProp) => {
  const id = useCurrentVaultId()
  const vaults = useVaults()

  if (!id) {
    return <>{children}</>
  }

  const vault = shouldBePresent(vaults.find(vault => getVaultId(vault) === id))

  return <CurrentVaultProvider value={vault}>{children}</CurrentVaultProvider>
}

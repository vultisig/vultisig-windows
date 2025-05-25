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

type CurrentVault = (Vault & Partial<{ coins: AccountCoin[] }>) | null

export const {
  useValue: useInternalCurrentVault,
  provider: CurrentVaultProvider,
} = getValueProviderSetup<CurrentVault>(currentVaultContextId)

export const useCurrentVault = () => {
  const currentVault = useInternalCurrentVault()

  return shouldBePresent(currentVault)
}

export const useCurrentVaultSecurityType = (): VaultSecurityType => {
  const { signers, localPartyId } = useCurrentVault()

  return hasServer(signers) && !isServer(localPartyId) ? 'fast' : 'secure'
}

export const RootCurrentVaultProvider = ({ children }: ChildrenProp) => {
  const id = useCurrentVaultId()
  const vaults = useVaults()
  const vault = vaults.find(vault => getVaultId(vault) === id) || null

  return <CurrentVaultProvider value={vault}>{children}</CurrentVaultProvider>
}

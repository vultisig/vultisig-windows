import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

import { decryptVaultKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useCurrentVaultId } from '../../storage/currentVaultId'
import { useVaults } from '../../storage/vaults'

export const currentVaultContextId = 'CurrentVault'

export const { useValue: useCurrentVault, provider: CurrentVaultProvider } =
  getValueProviderSetup<
    (Vault & Partial<{ coins: AccountCoin[] }>) | undefined
  >(currentVaultContextId)

export const useCurrentVaultSecurityType = (): VaultSecurityType => {
  const { signers, localPartyId } = useCurrentVault()

  return hasServer(signers) && !isServer(localPartyId) ? 'fast' : 'secure'
}

export const RootCurrentVaultProvider = ({ children }: ChildrenProp) => {
  const id = useCurrentVaultId()
  const vaults = useVaults()
  const [passcode] = usePasscode()

  const value = useMemo(() => {
    const vault = vaults.find(vault => getVaultId(vault) === id)

    if (vault && passcode) {
      try {
        return {
          ...vault,
          keyShares: decryptVaultKeyShares({
            keyShares: vault.keyShares,
            key: passcode,
          }),
        }
      } catch {
        return vault
      }
    }

    return vault
  }, [vaults, id, passcode])

  return <CurrentVaultProvider value={value}>{children}</CurrentVaultProvider>
}

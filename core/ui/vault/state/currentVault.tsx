import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { getVaultId, Vault } from '@core/mpc/vault/Vault'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { ChildrenProp } from '@lib/ui/props'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { useMemo } from 'react'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import { decryptVaultAllKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useCurrentVaultId } from '../../storage/currentVaultId'
import { useVaults } from '../../storage/vaults'

export const currentVaultContextId = 'CurrentVault'

export const [CurrentVaultProvider, useCurrentVault] = setupValueProvider<
  Vault & Partial<{ coins: AccountCoin[] }>
>(currentVaultContextId)

export const useCurrentVaultSecurityType = (): VaultSecurityType => {
  const { signers, localPartyId } = useCurrentVault()

  if (hasServer(signers)) {
    if (isServer(localPartyId)) {
      return 'secure'
    }

    const nonServerSignerCount = signers.filter(
      signer => !isServer(signer)
    ).length

    return nonServerSignerCount < 2 ? 'fast' : 'secure'
  }

  return 'secure'
}

export const RootCurrentVaultProvider = ({ children }: ChildrenProp) => {
  const id = useCurrentVaultId()
  const vaults = useVaults()
  const [passcode] = usePasscode()

  const value = useMemo(() => {
    const vault = vaults.find(vault => getVaultId(vault) === id)

    if (vault && passcode) {
      try {
        const { keyShares, chainKeyShares } = decryptVaultAllKeyShares({
          keyShares: vault.keyShares,
          chainKeyShares: vault.chainKeyShares,
          key: passcode,
        })
        return {
          ...vault,
          keyShares,
          chainKeyShares,
        }
      } catch {
        return vault
      }
    }

    return vault
  }, [vaults, id, passcode])

  if (!value) {
    return <>{children}</>
  }

  return <CurrentVaultProvider value={value}>{children}</CurrentVaultProvider>
}

export const useCurrentVaultPublicKey = (chain: Chain) => {
  const walletCore = useAssertWalletCore()
  const { hexChainCode, publicKeys, chainPublicKeys } = useCurrentVault()

  return useMemo(
    () =>
      getPublicKey({
        chain,
        walletCore,
        hexChainCode,
        publicKeys,
        chainPublicKeys,
      }),
    [chain, hexChainCode, publicKeys, walletCore, chainPublicKeys]
  )
}

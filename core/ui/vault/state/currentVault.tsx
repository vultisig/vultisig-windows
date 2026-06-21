import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { ChildrenProp } from '@lib/ui/props'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { hasServer, isServer } from '@vultisig/core-mpc/devices/localPartyId'
import {
  getVaultId,
  Vault,
  VaultAllKeyShares,
} from '@vultisig/core-mpc/vault/Vault'
import { useEffect, useMemo, useState } from 'react'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import { decryptVaultAllKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useCurrentVaultId } from '../../storage/currentVaultId'
import { useVaults } from '../../storage/vaults'

export const currentVaultContextId = 'CurrentVault'

export const [CurrentVaultProvider, useCurrentVault, CurrentVaultContext] =
  setupValueProvider<Vault & Partial<{ coins: AccountCoin[] }>>(
    currentVaultContextId
  )

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

  const vault = vaults.find(vault => getVaultId(vault) === id)

  // Decryption runs the PBKDF2 KDF, so it happens asynchronously (off the UI
  // thread). The result is tagged with the exact source vault object it was
  // derived from, not just the vault id: a reshare keeps the same id
  // (`publicKeys.ecdsa`) but changes the key shares, so an id-only tag could
  // merge stale shares. Until decryption resolves (or when no passcode is set)
  // the vault is provided with its stored shares.
  const [decrypted, setDecrypted] = useState<{
    sourceVault: Vault
    shares: VaultAllKeyShares
  } | null>(null)

  useEffect(() => {
    if (!vault || !passcode) {
      setDecrypted(null)
      return
    }

    let cancelled = false

    decryptVaultAllKeyShares({
      keyShares: vault.keyShares,
      chainKeyShares: vault.chainKeyShares,
      keyShareMldsa: vault.keyShareMldsa,
      key: passcode,
    })
      .then(shares => {
        if (!cancelled) {
          setDecrypted({ sourceVault: vault, shares })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDecrypted(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [vault, passcode])

  const value =
    vault && decrypted?.sourceVault === vault
      ? { ...vault, ...decrypted.shares }
      : vault

  return (
    <CurrentVaultContext.Provider value={value}>
      {children}
    </CurrentVaultContext.Provider>
  )
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

/** Returns the WalletCore PublicKey for the given chain, or null for MLDSA chains. */
export const useCurrentVaultNullablePublicKey = (chain: Chain) => {
  const walletCore = useAssertWalletCore()
  const { hexChainCode, publicKeys, chainPublicKeys } = useCurrentVault()

  return useMemo(() => {
    if (getSignatureAlgorithm(chain) === 'mldsa') {
      return null
    }

    return getPublicKey({
      chain,
      walletCore,
      hexChainCode,
      publicKeys,
      chainPublicKeys,
    })
  }, [chain, hexChainCode, publicKeys, walletCore, chainPublicKeys])
}

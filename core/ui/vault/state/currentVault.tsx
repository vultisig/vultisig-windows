import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { useCore } from '@core/ui/state/core'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { useNavigation } from '@lib/ui/navigation/state'
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
import { useEffect, useMemo, useRef, useState } from 'react'
import { createContext, useContext } from 'react'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import {
  readVaultAllKeyShares,
  UnreadableVaultKeySharesError,
} from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useIsPasscodeRequired } from '../../passcodeEncryption/state/useIsPasscodeRequired'
import { useCurrentVaultId } from '../../storage/currentVaultId'
import { useVaults } from '../../storage/vaults'
import { UnreadableVaultRecovery } from './UnreadableVaultRecovery'

const UnreadableVaultRecoveryContext = createContext<string | null>(null)

export const useUnreadableVaultRecoveryId = () =>
  useContext(UnreadableVaultRecoveryContext)

export const currentVaultContextId = 'CurrentVault'

export const [CurrentVaultProvider, useCurrentVault, CurrentVaultContext] =
  setupValueProvider<Vault & Partial<{ coins: AccountCoin[] }>>(
    currentVaultContextId
  )

type CurrentVaultValue = (Vault & Partial<{ coins: AccountCoin[] }>) | undefined

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

const sortedEntries = (
  record: Record<string, string | undefined> | undefined
) => Object.entries(record ?? {}).sort(([a], [b]) => a.localeCompare(b))

type GetVaultShareKeyInput = {
  vault: Vault
  hasPasscodeEncryption: boolean
}

/**
 * Identifies every input a readability result was derived from. Storage
 * rebuilds vault objects on every refetch, so tagging a settled result with the
 * object it came from would discard it — and blank the app — on writes that
 * never touched the shares. A reshare keeps the vault id but replaces the
 * shares, and the same stored bytes read differently once encryption is
 * switched on or off, so both are part of the key.
 */
const getVaultShareKey = ({
  vault: {
    keyShares,
    chainKeyShares,
    keyShareMldsa,
    libType,
    publicKeys,
    chainPublicKeys,
    publicKeyMldsa,
  },
  hasPasscodeEncryption,
}: GetVaultShareKeyInput) =>
  JSON.stringify([
    hasPasscodeEncryption,
    libType,
    keyShareMldsa ?? null,
    publicKeyMldsa ?? null,
    sortedEntries(keyShares),
    sortedEntries(chainKeyShares),
    sortedEntries(publicKeys),
    sortedEntries(chainPublicKeys),
  ])

export const RootCurrentVaultProvider = ({ children }: ChildrenProp) => {
  const { validateLegacyVaultKeyShares } = useCore()
  const [navigation] = useNavigation()
  const id = useCurrentVaultId()
  const vaults = useVaults()
  const [passcode] = usePasscode()
  const hasPasscodeEncryption = useIsPasscodeRequired()

  const vault = vaults.find(vault => getVaultId(vault) === id)

  const shareKey = vault
    ? getVaultShareKey({ vault, hasPasscodeEncryption })
    : null

  // The result is tagged with the share material it came from. A reshare keeps
  // the same vault id but changes the shares, so id-only state could expose a
  // stale result. Stored shares are never provided while readability is
  // unresolved.
  const [shareState, setShareState] = useState<{
    shareKey: string
    result:
      | { status: 'ready'; shares: VaultAllKeyShares }
      | { status: 'unreadable' }
      | { status: 'error'; error: Error }
  } | null>(null)

  useEffect(() => {
    if (!vault || (hasPasscodeEncryption && !passcode)) {
      setShareState(null)
      return
    }

    let cancelled = false

    readVaultAllKeyShares({
      keyShares: vault.keyShares,
      chainKeyShares: vault.chainKeyShares,
      keyShareMldsa: vault.keyShareMldsa,
      libType: vault.libType,
      publicKeys: vault.publicKeys,
      chainPublicKeys: vault.chainPublicKeys,
      publicKeyMldsa: vault.publicKeyMldsa,
      validateLegacyVaultKeyShares,
      hasPasscodeEncryption,
      key: passcode,
    })
      .then(shares => {
        if (!cancelled) {
          setShareState({
            shareKey: getVaultShareKey({ vault, hasPasscodeEncryption }),
            result: { status: 'ready', shares },
          })
        }
      })
      .catch(error => {
        if (!cancelled) {
          setShareState({
            shareKey: getVaultShareKey({ vault, hasPasscodeEncryption }),
            result:
              error instanceof UnreadableVaultKeySharesError
                ? { status: 'unreadable' }
                : {
                    status: 'error',
                    error:
                      error instanceof Error
                        ? error
                        : new Error('Failed to read vault key shares'),
                  },
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [vault, passcode, hasPasscodeEncryption, validateLegacyVaultKeyShares])

  const resolution =
    shareState && shareState.shareKey === shareKey ? shareState.result : null

  const isImportView =
    navigation.history[navigation.history.length - 1]?.id === 'importVault'

  // What the tree below was last given: either no vault at all, or a vault
  // whose shares were already proven. While a vault's shares are unresolved
  // the tree holds that value instead of being torn down — replacing it with a
  // splash unmounts every screen under this provider and discards their
  // in-flight state, which is what dropped the fast vault setup flow back on
  // its first step when the vault it had just saved became current (#4832).
  // Holding never exposes unproven shares: the held value was either absent or
  // proven.
  const heldValue = useRef<{ value: CurrentVaultValue } | null>(null)

  const provided: { value: CurrentVaultValue } | null = (() => {
    if (!vault) {
      return { value: undefined }
    }

    if (hasPasscodeEncryption && !passcode) {
      return null
    }

    if (!resolution) {
      const held = heldValue.current

      // A reshare keeps the vault id and replaces the shares, so holding here
      // would pair this vault with shares it no longer has. Nothing is held
      // for a tree that has not rendered yet either, which is what keeps vault
      // screens from mounting against shares that were never read.
      const isStaleSameVault =
        held?.value !== undefined &&
        getVaultId(held.value) === getVaultId(vault)

      return isStaleSameVault ? null : held
    }

    if (resolution.status === 'error') {
      return null
    }

    if (resolution.status === 'unreadable') {
      return isImportView ? { value: undefined } : null
    }

    return { value: { ...vault, ...resolution.shares } }
  })()

  useEffect(() => {
    if (provided) {
      heldValue.current = provided
    }
  })

  if (resolution?.status === 'error') {
    throw resolution.error
  }

  const isUnreadable = resolution?.status === 'unreadable'

  if (!provided) {
    return isUnreadable ? <UnreadableVaultRecovery /> : <ProductLogoBlock />
  }

  const tree = (
    <CurrentVaultContext.Provider value={provided.value}>
      {children}
    </CurrentVaultContext.Provider>
  )

  return isUnreadable && vault ? (
    <UnreadableVaultRecoveryContext.Provider value={getVaultId(vault)}>
      {tree}
    </UnreadableVaultRecoveryContext.Provider>
  ) : (
    tree
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

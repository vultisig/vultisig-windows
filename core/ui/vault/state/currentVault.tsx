import { CoreViewId } from '@core/ui/navigation/CoreView'
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
import {
  getVaultReadabilityInputs,
  hasSameReadabilityInputs,
  VaultReadabilityInputs,
} from './vaultReadability'

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

/**
 * Views whose flow writes a new vault and keeps running past the save: the
 * setup flows continue into backup steps held in component state, so the tree
 * has to survive the vault they wrote becoming current. Anywhere else a
 * current vault switch is the user picking another existing vault, and the
 * tree is withheld until that vault's shares are proven so no screen keeps
 * showing or acting on the previous vault under the new id.
 */
const vaultWritingViews: ReadonlySet<string> = new Set<CoreViewId>([
  'setupFastVault',
  'setupSecureVault',
  'joinKeygen',
  'importVault',
])

/**
 * Holds on to the previous snapshot for as long as `hasSameReadabilityInputs`
 * still accepts it, so the read effect can take a single dependency that
 * changes exactly when a re-read is owed — including share material replaced
 * under a vault object that kept its identity, which observing the vault by
 * reference alone would miss. One predicate then drives both the re-read and
 * whether a settled result still applies, so an input added to
 * {@link VaultReadabilityInputs} is honoured by both without being listed in
 * either.
 */
const useStableReadabilityInputs = (inputs: VaultReadabilityInputs | null) => {
  const stable = useRef<VaultReadabilityInputs | null>(null)

  if (
    !inputs ||
    !stable.current ||
    !hasSameReadabilityInputs({ resolved: stable.current, current: inputs })
  ) {
    stable.current = inputs
  }

  return stable.current
}

export const RootCurrentVaultProvider = ({ children }: ChildrenProp) => {
  const { validateLegacyVaultKeyShares } = useCore()
  const [navigation] = useNavigation()
  const id = useCurrentVaultId()
  const vaults = useVaults()
  const [passcode] = usePasscode()
  const hasPasscodeEncryption = useIsPasscodeRequired()

  const vault = vaults.find(vault => getVaultId(vault) === id)

  // Snapshotted during render, before any read is started, so a result can
  // never be attributed to inputs it was not read under, and stable while
  // nothing it carries changes, so it can be the read's only dependency.
  const readabilityInputs = useStableReadabilityInputs(
    vault && !(hasPasscodeEncryption && !passcode)
      ? getVaultReadabilityInputs({
          vault,
          hasPasscodeEncryption,
          passcode,
          validateLegacyVaultKeyShares,
        })
      : null
  )

  // The result is tagged with the exact inputs it was read under. A reshare
  // keeps the same id but changes the shares, and a passcode change re-reads
  // the same bytes, so id-only state could expose a stale result. Stored shares
  // are never provided while readability is unresolved.
  const [shareState, setShareState] = useState<{
    source: VaultReadabilityInputs
    result:
      | { status: 'ready'; shares: VaultAllKeyShares }
      | { status: 'unreadable' }
      | { status: 'error'; error: Error }
  } | null>(null)

  useEffect(() => {
    if (!readabilityInputs) {
      setShareState(null)
      return
    }

    const source = readabilityInputs
    let cancelled = false

    readVaultAllKeyShares({
      keyShares: source.keyShares,
      chainKeyShares: source.chainKeyShares,
      keyShareMldsa: source.keyShareMldsa,
      libType: source.libType,
      publicKeys: source.publicKeys,
      chainPublicKeys: source.chainPublicKeys,
      publicKeyMldsa: source.publicKeyMldsa,
      validateLegacyVaultKeyShares: source.validateLegacyVaultKeyShares,
      hasPasscodeEncryption: source.hasPasscodeEncryption,
      key: source.passcode,
    })
      .then(shares => {
        if (!cancelled) {
          setShareState({
            source,
            result: { status: 'ready', shares },
          })
        }
      })
      .catch(error => {
        if (!cancelled) {
          setShareState({
            source,
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
  }, [readabilityInputs])

  const resolution =
    shareState &&
    readabilityInputs &&
    hasSameReadabilityInputs({
      resolved: shareState.source,
      current: readabilityInputs,
    })
      ? shareState.result
      : null

  const viewId = navigation.history[navigation.history.length - 1]?.id
  const isImportView = viewId === 'importVault'
  const isVaultWritingView =
    viewId !== undefined && vaultWritingViews.has(viewId)

  // What the tree below was last given: either no vault at all, or a vault
  // whose shares were already proven. While the vault a setup flow just wrote
  // is unresolved, the tree holds that value instead of being torn down —
  // replacing it with a splash unmounts every screen under this provider and
  // discards their in-flight state, which is what dropped the fast vault setup
  // flow back on its first step when the vault it had just saved became
  // current (#4832). Holding never exposes unproven shares: the held value was
  // either absent or proven.
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

      return isVaultWritingView && !isStaleSameVault ? held : null
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

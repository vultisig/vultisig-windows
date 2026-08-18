import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { useCore } from '@core/ui/state/core'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigation } from '@lib/ui/navigation/state'
import { PageHeader } from '@lib/ui/page/PageHeader'
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
import { createContext, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import { readVaultAllKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useCurrentVaultId } from '../../storage/currentVaultId'
import { useHasPasscodeEncryption } from '../../storage/passcodeEncryption'
import { useVaults } from '../../storage/vaults'

const UnreadableVaultRecoveryContext = createContext<string | null>(null)

export const useUnreadableVaultRecoveryId = () =>
  useContext(UnreadableVaultRecoveryContext)

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

const VaultCannotBeOpened = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <VStack fullSize>
      <PageHeader />
      <FlowErrorPageContent
        title={t('vault_cannot_be_opened')}
        description={t('vault_cannot_be_opened_description')}
        variant="error"
        action={
          <Button onClick={() => navigate({ id: 'importVault' })}>
            {t('import_vault_share')}
          </Button>
        }
      />
    </VStack>
  )
}

export const RootCurrentVaultProvider = ({ children }: ChildrenProp) => {
  const { validateLegacyVaultKeyShares } = useCore()
  const [navigation] = useNavigation()
  const id = useCurrentVaultId()
  const vaults = useVaults()
  const [passcode] = usePasscode()
  const hasPasscodeEncryption = useHasPasscodeEncryption()

  const vault = vaults.find(vault => getVaultId(vault) === id)

  // The result is tagged with the exact source vault object it came from. A
  // reshare keeps the same id but changes the shares, so id-only state could
  // expose a stale result. Stored shares are never provided while readability
  // is unresolved.
  const [shareState, setShareState] = useState<{
    sourceVault: Vault
    result:
      | { status: 'ready'; shares: VaultAllKeyShares }
      | { status: 'unreadable' }
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
            sourceVault: vault,
            result: { status: 'ready', shares },
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShareState({
            sourceVault: vault,
            result: { status: 'unreadable' },
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [vault, passcode, hasPasscodeEncryption, validateLegacyVaultKeyShares])

  if (!vault) {
    return (
      <CurrentVaultContext.Provider value={undefined}>
        {children}
      </CurrentVaultContext.Provider>
    )
  }

  if (hasPasscodeEncryption && !passcode) {
    return <ProductLogoBlock />
  }

  if (shareState?.sourceVault !== vault) {
    return <ProductLogoBlock />
  }

  if (shareState.result.status === 'unreadable') {
    if (
      navigation.history[navigation.history.length - 1]?.id === 'importVault'
    ) {
      return (
        <UnreadableVaultRecoveryContext.Provider value={getVaultId(vault)}>
          <CurrentVaultContext.Provider value={undefined}>
            {children}
          </CurrentVaultContext.Provider>
        </UnreadableVaultRecoveryContext.Provider>
      )
    }

    return <VaultCannotBeOpened />
  }

  const value = { ...vault, ...shareState.result.shares }

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

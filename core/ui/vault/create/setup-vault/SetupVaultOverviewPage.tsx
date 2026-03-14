import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { VaultSetupOverviewContent } from '@core/ui/vault/create/setup-vault/vault-setup-overview/VaultSetupOverviewContent'
import { VaultExistsOnServerWarning } from '@core/ui/vault/create/setup-vault/VaultExistsOnServerWarning'
import { useVaultExistsOnServerQuery } from '@core/ui/vault/import/seedphrase/hooks/useVaultExistsOnServerQuery'
import { deriveEcdsaPublicKeyFromMnemonic } from '@core/ui/vault/import/seedphrase/utils/deriveEcdsaPublicKeyFromMnemonic'
import { attempt, withFallback } from '@lib/utils/attempt'
import { useEffect, useState } from 'react'

export const SetupVaultOverviewPage = () => {
  const [viewState] = useCoreViewState<'setupVaultOverview'>()
  const navigate = useCoreNavigate()
  const { goBack } = useCore()
  const walletCore = useAssertWalletCore()
  const [showWarning, setShowWarning] = useState(false)

  const selectedDeviceCount = viewState?.selectedDeviceCount
  const keyImportInput = viewState?.keyImportInput
  const isFastVault = selectedDeviceCount === 0

  const ecdsaPublicKey =
    isFastVault && keyImportInput
      ? withFallback(
          attempt(() =>
            deriveEcdsaPublicKeyFromMnemonic({
              mnemonic: keyImportInput.mnemonic,
              walletCore,
            })
          ),
          null
        )
      : null

  const { data: vaultExistsOnServer } = useVaultExistsOnServerQuery({
    ecdsaPublicKey,
  })

  useEffect(() => {
    if (selectedDeviceCount === undefined) {
      goBack()
    }
  }, [selectedDeviceCount, goBack])

  if (selectedDeviceCount === undefined) {
    return null
  }

  const navigateToFastVault = () => {
    navigate({
      id: 'setupFastVault',
      state: { keyImportInput },
    })
  }

  const handleGetStarted = () => {
    if (isFastVault) {
      if (vaultExistsOnServer) {
        setShowWarning(true)
        return
      }
      navigateToFastVault()
    } else {
      navigate({
        id: 'setupSecureVault',
        state: {
          keyImportInput,
          deviceCount: selectedDeviceCount + 1,
        },
      })
    }
  }

  if (showWarning) {
    return (
      <VaultExistsOnServerWarning
        onContinue={navigateToFastVault}
        onBack={() => setShowWarning(false)}
      />
    )
  }

  return (
    <VaultSetupOverviewContent
      selectedDeviceCount={selectedDeviceCount}
      onBack={goBack}
      onGetStarted={handleGetStarted}
    />
  )
}

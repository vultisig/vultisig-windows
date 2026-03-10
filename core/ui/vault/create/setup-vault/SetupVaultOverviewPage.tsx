import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { VaultSetupOverviewContent } from '@core/ui/vault/create/setup-vault/vault-setup-overview/VaultSetupOverviewContent'
import { useEffect } from 'react'

export const SetupVaultOverviewPage = () => {
  const [viewState] = useCoreViewState<'setupVaultOverview'>()
  const navigate = useCoreNavigate()
  const { goBack } = useCore()

  useEffect(() => {
    if (viewState?.selectedDeviceCount === undefined) {
      goBack()
    }
  }, [viewState?.selectedDeviceCount, goBack])

  if (viewState?.selectedDeviceCount === undefined) {
    return null
  }

  const { selectedDeviceCount, keyImportInput } = viewState

  const handleGetStarted = () => {
    if (selectedDeviceCount === 0) {
      navigate({
        id: 'setupFastVault',
        state: { keyImportInput },
      })
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

  return (
    <VaultSetupOverviewContent
      selectedDeviceCount={selectedDeviceCount}
      onBack={goBack}
      onGetStarted={handleGetStarted}
    />
  )
}

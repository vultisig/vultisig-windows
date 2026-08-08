import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { DeviceCountPicker } from '@core/ui/vault/create/setup-vault/DeviceCountPicker'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

export const SetupVaultPage = () => {
  const navigate = useCoreNavigate()
  const goBack = useNavigateBack()
  const [state] = useCoreViewState<'setupVault'>()

  return (
    <DeviceCountPicker
      onBack={goBack}
      onSubmit={selectedDeviceCount =>
        navigate({
          id: 'setupVaultOverview',
          state: {
            selectedDeviceCount,
            keyImportInput: state?.keyImportInput,
          },
        })
      }
    />
  )
}

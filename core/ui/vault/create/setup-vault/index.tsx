import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { DeviceSelectionTip } from '@core/ui/vault/create/setup-vault/DeviceSelectionTip'
import { useDeviceSelectionAnimation } from '@core/ui/vault/create/setup-vault/hooks/useDeviceSelectionAnimation'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { useTranslation } from 'react-i18next'

export const SetupVaultPage = () => {
  const { RiveComponent, selectedDeviceCount } = useDeviceSelectionAnimation()
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [state] = useCoreViewState<'setupVault'>()

  const handleContinue = () => {
    const destination =
      selectedDeviceCount === 0 ? 'setupFastVault' : 'setupSecureVault'
    navigate({
      id: destination,
      state: { keyImportInput: state?.keyImportInput },
    })
  }

  return (
    <FitPageContent contentMaxWidth={576}>
      <VStack gap={16} fullSize style={{ paddingTop: 32 }}>
        <RiveComponent />
        <DeviceSelectionTip />
        <Button onClick={handleContinue}>{t('next')}</Button>
      </VStack>
    </FitPageContent>
  )
}

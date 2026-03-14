import { Button } from '@lib/ui/buttons/Button'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

type VaultExistsOnServerWarningProps = {
  onContinue: () => void
  onBack: () => void
}

/** Warns the user that a vault with this seed phrase already exists on the server. */
export const VaultExistsOnServerWarning = ({
  onContinue,
  onBack,
}: VaultExistsOnServerWarningProps) => {
  const { t } = useTranslation()

  return (
    <ScreenLayout
      title={t('fast_vault_exists_warning_title')}
      onBack={onBack}
      footer={
        <VStack gap={8} fullWidth>
          <Button onClick={onContinue}>{t('continue')}</Button>
          <Button kind="secondary" onClick={onBack}>
            {t('back')}
          </Button>
        </VStack>
      }
    >
      <VStack gap={24} flexGrow justifyContent="center">
        <WarningBlock>
          {t('fast_vault_exists_warning_description')}
        </WarningBlock>
        <Text size={14} color="shy">
          {t('fast_vault_exists_warning_hint')}
        </Text>
      </VStack>
    </ScreenLayout>
  )
}

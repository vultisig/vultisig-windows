import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
      <VStack gap={16} flexGrow justifyContent="center">
        <WarningCard alignItems="start" gap={12}>
          <WarningIconContainer>
            <TriangleAlertIcon />
          </WarningIconContainer>
          <VStack gap={8}>
            <Text color="idle" size={14} weight="500">
              {t('fast_vault_exists_warning_description')}
            </Text>
            <Text color="idle" size={13} weight="400">
              {t('fast_vault_exists_warning_hint')}
            </Text>
          </VStack>
        </WarningCard>
      </VStack>
    </ScreenLayout>
  )
}

const WarningCard = styled(HStack)`
  ${borderRadius.m};
  background-color: ${getColor('idleDark')};
  border: 1px solid ${getColor('idle')};
  padding: 16px;
`

const WarningIconContainer = styled(IconWrapper)`
  color: ${getColor('idle')};
  font-size: 20px;
  flex-shrink: 0;
  padding-top: 2px;
`

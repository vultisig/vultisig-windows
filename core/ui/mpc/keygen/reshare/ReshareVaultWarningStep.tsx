import { Button } from '@lib/ui/buttons/Button'
import { RadioTowerIcon } from '@lib/ui/icons/RadioTowerIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ReshareVaultWarningStepProps = {
  onBack: () => void
  onConfirm: () => void
}

const IconBox = styled.div`
  align-items: center;
  background: ${({ theme }) =>
    theme.colors.idle.getVariant({ a: () => 0.12 }).toCssValue()};
  border-radius: 10px;
  color: ${getColor('idle')};
  display: flex;
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  width: 36px;
`

export const ReshareVaultWarningStep = ({
  onBack,
  onConfirm,
}: ReshareVaultWarningStepProps) => {
  const { t } = useTranslation()

  const warnings: { icon: ReactNode; title: string; description: string }[] = [
    {
      icon: <TriangleAlertIcon fontSize={20} />,
      title: t('reshare_warning_old_backups_title'),
      description: t('reshare_warning_old_backups_description'),
    },
    {
      icon: <RadioTowerIcon fontSize={20} />,
      title: t('reshare_warning_cosigners_title'),
      description: t('reshare_warning_cosigners_description'),
    },
  ]

  return (
    <ScreenLayout
      onBack={onBack}
      footer={<Button onClick={onConfirm}>{t('i_understand')}</Button>}
    >
      <VStack gap={24} flexGrow justifyContent="center">
        <VStack gap={8}>
          <Text color="contrast" size={22} weight={500} centerHorizontally>
            {t('before_you_reshare')}
          </Text>
          <Text color="supporting" size={14} centerHorizontally>
            {t('before_you_reshare_subtitle')}
          </Text>
        </VStack>
        <VStack gap={12}>
          {warnings.map(({ icon, title, description }) => (
            <Panel key={title}>
              <HStack gap={12}>
                <IconBox>{icon}</IconBox>
                <VStack gap={4}>
                  <Text color="contrast" size={16} weight={500}>
                    {title}
                  </Text>
                  <Text color="supporting" size={14}>
                    {description}
                  </Text>
                </VStack>
              </HStack>
            </Panel>
          ))}
        </VStack>
      </VStack>
    </ScreenLayout>
  )
}

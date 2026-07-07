import { Button } from '@lib/ui/buttons/Button'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReshareCosignersIcon } from './ReshareCosignersIcon'
import { ReshareOldBackupsIcon } from './ReshareOldBackupsIcon'

type ReshareVaultWarningStepProps = {
  onBack: () => void
  onConfirm: () => void
}

const Header = styled(VStack)`
  padding: 24px 16px 8px;
`

const WarningCard = styled.div`
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  padding: 20px;
`

export const ReshareVaultWarningStep = ({
  onBack,
  onConfirm,
}: ReshareVaultWarningStepProps) => {
  const { t } = useTranslation()

  const warnings: { icon: ReactNode; title: string; description: string }[] = [
    {
      icon: <ReshareOldBackupsIcon />,
      title: t('reshare_warning_old_backups_title'),
      description: t('reshare_warning_old_backups_description'),
    },
    {
      icon: <ReshareCosignersIcon />,
      title: t('reshare_warning_cosigners_title'),
      description: t('reshare_warning_cosigners_description'),
    },
  ]

  return (
    <ScreenLayout
      onBack={onBack}
      footer={<Button onClick={onConfirm}>{t('i_understand')}</Button>}
    >
      <VStack gap={28} flexGrow>
        <Header gap={8}>
          <Text color="contrast" size={22} weight={500} centerHorizontally>
            {t('before_you_reshare')}
          </Text>
          <Text color="shy" size={13} weight={500} centerHorizontally>
            {t('before_you_reshare_subtitle')}
          </Text>
        </Header>
        <VStack gap={12}>
          {warnings.map(({ icon, title, description }) => (
            <WarningCard key={title}>
              <HStack gap={12} alignItems="flex-start">
                <IconWrapper color="idle" size={24}>
                  {icon}
                </IconWrapper>
                <VStack gap={8}>
                  <Text color="contrast" size={15} weight={500}>
                    {title}
                  </Text>
                  <Text color="shy" size={13} weight={500}>
                    {description}
                  </Text>
                </VStack>
              </HStack>
            </WarningCard>
          ))}
        </VStack>
      </VStack>
    </ScreenLayout>
  )
}

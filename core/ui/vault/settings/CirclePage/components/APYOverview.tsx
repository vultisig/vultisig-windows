import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const APYOverview = () => {
  const { t } = useTranslation()

  return (
    <HStack justifyContent="space-between" alignItems="center" gap={8}>
      <HStack gap={4} alignItems="center">
        <IconWrapper size={16} color="textSupporting">
          <PercentIcon />
        </IconWrapper>
        <Text size={14} color="supporting">
          {t('circle.apy')}
        </Text>
      </HStack>
      <Text size={16} color="success">
        {/* 
          TODO: tony to fill in with real values when API is available
        */}
      </Text>
    </HStack>
  )
}

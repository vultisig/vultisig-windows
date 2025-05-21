import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useResponsiveness } from '../../../providers/ResponsivenessProivder'
import { TextWrapper } from './AnimationDescriptions.styled'

export const VaultDevice = () => {
  const { t } = useTranslation()
  const { isSmall } = useResponsiveness()

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={isSmall ? 18 : 48}>
          <GradientText as="span">{t('eachDevice')}</GradientText>{' '}
          {t('inYourVaultHolds')}{' '}
          <GradientText as="span">{t('oneVaultShare')}</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

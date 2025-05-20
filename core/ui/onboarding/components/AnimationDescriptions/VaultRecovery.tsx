import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useResponsiveness } from '../../../providers/ResponsivenessProivder'
import { TextWrapper } from './AnimationDescriptions.styled'

export const VaultRecovery = () => {
  const { t } = useTranslation()
  const { isSmall } = useResponsiveness()

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={isSmall ? 18 : 48}>
          {t('recoverYourVault')}{' '}
        </Text>
        <GradientText as="span" size={isSmall ? 18 : 48}>
          {t('deviceLostOrDamaged')}
        </GradientText>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

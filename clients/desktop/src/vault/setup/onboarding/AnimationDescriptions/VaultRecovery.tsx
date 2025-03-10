import { useTranslation } from 'react-i18next'

import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '../../../../lib/ui/text'
import { TextWrapper } from './AnimationDescriptions.styled'

export const VaultRecovery = () => {
  const { t } = useTranslation()

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={42}>
          {t('recoverYourVault')}{' '}
        </Text>
        <GradientText as="span" size={42}>
          {t('deviceLostOrDamaged')}
        </GradientText>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

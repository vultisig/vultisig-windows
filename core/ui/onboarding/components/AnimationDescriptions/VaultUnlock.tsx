import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useResponsiveness } from '../../../providers/ResponsivenessProivder'
import { TextWrapper } from './AnimationDescriptions.styled'

export const VaultUnlock = () => {
  const { t } = useTranslation()
  const { isMobileScreen } = useResponsiveness()

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={isMobileScreen ? 18 : 48}>
          {t('theseSharesCollaborate')}{' '}
        </Text>
        <GradientText as="span" size={isMobileScreen ? 18 : 48}>
          {t('unlockYourVault')}
        </GradientText>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

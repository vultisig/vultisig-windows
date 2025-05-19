import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useResponsiveness } from '../../../providers/ResponsivenessProivder'
import { TextWrapper } from './AnimationDescriptions.styled'

export const VaultSharesInfo = () => {
  const { t } = useTranslation()
  const { isMobileScreen } = useResponsiveness()

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={isMobileScreen ? 18 : 48}>
          {t('theyRe')}{' '}
          <GradientText as="span" size={isMobileScreen ? 18 : 48}>
            {t('splitIntoParts')}
          </GradientText>{' '}
          {t('toIncreaseSecurity')}{' '}
          <GradientText>{t('removeSinglePointOfFailure')}</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

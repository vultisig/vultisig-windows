import { TextWrapper } from '@clients/extension/src/components/onboarding/components/AnimationDescriptions/AnimationDescriptions.styled'
import { AnimatedVisibility } from '@clients/extension/src/components/shared/AnimatedVisibility'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const VaultSharesInfo = () => {
  const { t } = useTranslation()
  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={18}>
          {t('theyRe')}{' '}
          <GradientText as="span" size={18}>
            {t('splitIntoParts')}
          </GradientText>{' '}
          {t('toIncreaseSecurity')}{' '}
          <GradientText>{t('removeSinglePointOfFailure')}</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

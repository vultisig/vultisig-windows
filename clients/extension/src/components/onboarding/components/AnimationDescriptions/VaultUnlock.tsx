import { TextWrapper } from '@clients/extension/src/components/onboarding/components/AnimationDescriptions/AnimationDescriptions.styled'
import { AnimatedVisibility } from '@clients/extension/src/components/shared/AnimatedVisibility'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const VaultUnlock = () => {
  const { t } = useTranslation()

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={18}>
          {t('theseSharesCollaborate')}{' '}
        </Text>
        <GradientText as="span" size={18}>
          {t('unlockYourVault')}
        </GradientText>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

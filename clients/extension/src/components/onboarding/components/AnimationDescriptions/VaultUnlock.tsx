import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { AnimatedVisibility } from '../../../shared/AnimatedVisibility'
import { TextWrapper } from './AnimationDescriptions.styled'

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

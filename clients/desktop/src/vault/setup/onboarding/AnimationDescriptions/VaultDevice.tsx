import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility'
import { TextWrapper } from './AnimationDescriptions.styled'

export const VaultDevice = () => {
  const { t } = useTranslation()

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={42}>
          <GradientText as="span">{t('eachDevice')}</GradientText>{' '}
          {t('inYourVaultHolds')}{' '}
          <GradientText as="span">{t('oneVaultShare')}</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

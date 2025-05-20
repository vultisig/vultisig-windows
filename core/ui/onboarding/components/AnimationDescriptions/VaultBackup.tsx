import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useResponsiveness } from '../../../providers/ResponsivenessProivder'
import { TextWrapper } from './AnimationDescriptions.styled'

export const VaultBackup = () => {
  const { t } = useTranslation()
  const { isSmall } = useResponsiveness()
  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={isSmall ? 18 : 48}>
          <GradientText as="span">
            {t('alwaysBackUpEachVaultShare')}
          </GradientText>{' '}
          {t('separatelyIna')}{' '}
          <GradientText as="span">{t('differentLocation')}</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AnimatedVisibility } from '../../../shared/AnimatedVisibility'

const TextWrapper = styled.div`
  margin-inline: auto;
  max-width: 800px;
  text-align: center;
`

export const VaultSharesIntro = () => {
  const { t } = useTranslation()

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={18}>
          {t('sayHelloTo')}{' '}
        </Text>
        <GradientText as="span" size={18}>
          {t('vaultShares')},{' '}
        </GradientText>
        <Text as="span" size={18}>
          {t('yourNewRecoveryMethod')}
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

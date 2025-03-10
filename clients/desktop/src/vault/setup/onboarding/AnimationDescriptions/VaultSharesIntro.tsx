import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility'
import { GradientText, Text } from '../../../../lib/ui/text'

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
        <Text as="span" size={42}>
          {t('sayHelloTo')}{' '}
        </Text>
        <GradientText as="span" size={42}>
          {t('vaultShares')},{' '}
        </GradientText>
        <Text as="span" size={42}>
          {t('yourNewRecoveryMethod')}
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

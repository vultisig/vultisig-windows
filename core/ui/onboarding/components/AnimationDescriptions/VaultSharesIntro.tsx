import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { gradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
        <SizedText as="span" size={18}>
          {t('sayHelloTo')}{' '}
        </SizedText>
        <GradientSizedText as="span" size={18}>
          {t('vaultShares')},{' '}
        </GradientSizedText>
        <SizedText as="span" size={18}>
          {t('yourNewRecoveryMethod')}
        </SizedText>
      </TextWrapper>
    </AnimatedVisibility>
  )
}

const SizedText = styled(Text)`
  font-size: 18px;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    font-size: 48px;
  }
`

const GradientSizedText = styled(SizedText)`
  ${gradientText}
`

import { VStack } from '@lib/ui/layout/Stack'
import { GradientText, Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AnimatedVisibility } from '../../shared/AnimatedVisibility'

const DELAY_BEFORE_NEXT_STEP_IN_MS = 500

type OnboardingGreetingProps = {
  onCompleteGreeting: () => void
}

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
`

const ContentWrapper = styled(VStack)`
  padding-inline: 20px;
  margin-inline: auto;
  text-align: center;
`

export const OnboardingGreeting: FC<OnboardingGreetingProps> = ({
  onCompleteGreeting,
}) => {
  const { t } = useTranslation()

  return (
    <Wrapper data-testid="OnboardingGreeting-Wrapper">
      <AnimatedVisibility
        config={{
          duration: 1000,
        }}
        animationConfig="bottomToTop"
        delay={300}
        onAnimationComplete={() =>
          setTimeout(onCompleteGreeting, DELAY_BEFORE_NEXT_STEP_IN_MS)
        }
      >
        <ContentWrapper>
          <Text size={36}>
            {t('sayGoodbyeTo')}{' '}
            <GradientText as="span">{t('seedPhrases')}</GradientText>
          </Text>
        </ContentWrapper>
      </AnimatedVisibility>
    </Wrapper>
  )
}

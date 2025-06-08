import { useResponsiveness } from '@core/ui/providers/ResponsivenessProivder'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { GradientText, Text } from '@lib/ui/text'
import { Milliseconds } from '@lib/utils/time'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

const delayBeforeNextStep: Milliseconds = 500

type OnboardingGreetingProps = {
  onCompleteGreeting: () => void
}

export const OnboardingGreeting: FC<OnboardingGreetingProps> = ({
  onCompleteGreeting,
}) => {
  const { t } = useTranslation()
  const { isSmall } = useResponsiveness()

  return (
    <VStack fullHeight>
      <PageContent
        alignItems="center"
        justifyContent="center"
        flexGrow
        scrollable
      >
        <AnimatedVisibility
          animationConfig="bottomToTop"
          config={{ duration: 1000 }}
          delay={300}
          onAnimationComplete={() =>
            setTimeout(onCompleteGreeting, delayBeforeNextStep)
          }
        >
          <Text size={isSmall ? 36 : 52} centerHorizontally>
            {t('sayGoodbyeTo')}{' '}
            <GradientText as="span">{t('seedPhrases')}</GradientText>
          </Text>
        </AnimatedVisibility>
      </PageContent>
    </VStack>
  )
}

import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { Milliseconds } from '@lib/utils/time'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

const delayBeforeNextStep: Milliseconds = 500

export const OnboardingGreeting: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()

  return (
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
        onAnimationComplete={() => setTimeout(onFinish, delayBeforeNextStep)}
      >
        <VStack alignItems="center">
          <Text as="span" size={28}>
            {t('sayGoodbyeTo')}
          </Text>
          <GradientText as="span" size={28}>
            {t('seedPhrases')}
          </GradientText>
        </VStack>
      </AnimatedVisibility>
    </PageContent>
  )
}

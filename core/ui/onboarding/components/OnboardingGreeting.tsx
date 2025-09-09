import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { Milliseconds } from '@lib/utils/time'
import { FC } from 'react'
import { Trans } from 'react-i18next'

const delayBeforeNextStep: Milliseconds = 500

export const OnboardingGreeting: FC<OnFinishProp> = ({ onFinish }) => {
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
          <Text as="div" size={28} centerHorizontally>
            <Trans
              i18nKey="onboarding_greeting"
              components={{ g: <GradientText as="span" /> }}
            />
          </Text>
        </VStack>
      </AnimatedVisibility>
    </PageContent>
  )
}

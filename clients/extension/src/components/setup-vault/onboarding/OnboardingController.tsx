import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { VStack } from '@lib/ui/layout/Stack'

import { OnboardingGreeting } from './components/OnboardingGreeting'
import { OnboardingSteps } from './components/OnboardingSteps'
import { OnboardingSummary } from './components/OnboardingSummary'

const steps = [
  'onboardingGreeting',
  'onboardingSteps',
  'onboardingSummary',
] as const

export const OnboardingController = () => {
  const { step, toNextStep } = useStepNavigation({ steps })

  return (
    <VStack
      style={{
        minHeight: '100%',
      }}
    >
      <Match
        value={step}
        onboardingGreeting={() => (
          <OnboardingGreeting onCompleteGreeting={toNextStep} />
        )}
        onboardingSteps={() => <OnboardingSteps onCompleteSteps={toNextStep} />}
        onboardingSummary={() => <OnboardingSummary />}
      />
    </VStack>
  )
}

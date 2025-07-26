import { OnboardingGreeting } from '@core/ui/onboarding/components/OnboardingGreeting'
import { OnboardingSteps } from '@core/ui/onboarding/components/OnboardingSteps'
import { OnboardingSummary } from '@core/ui/onboarding/components/OnboardingSummary'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

const steps = ['greeting', 'steps', 'summary'] as const

export const OnboardingController = () => {
  const { step, toNextStep } = useStepNavigation({ steps })

  return (
    <Match
      value={step}
      greeting={() => <OnboardingGreeting onFinish={toNextStep} />}
      steps={() => <OnboardingSteps onFinish={toNextStep} />}
      summary={() => <OnboardingSummary />}
    />
  )
}

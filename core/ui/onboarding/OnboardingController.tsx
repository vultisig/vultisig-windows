import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { OnboardingGreeting } from '@core/ui/onboarding/components/OnboardingGreeting'
import { OnboardingSteps } from '@core/ui/onboarding/components/OnboardingSteps'
import { OnboardingSummary } from '@core/ui/onboarding/components/OnboardingSummary'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigation } from '@lib/ui/navigation/state'

const steps = ['greeting', 'steps', 'summary'] as const

export const OnboardingController = () => {
  const navigate = useCoreNavigate()
  const { goBack } = useCore()
  const [{ history }] = useNavigation()

  const handleExit = () => {
    if (history.length > 1) {
      goBack()
      return
    }

    navigate({ id: 'newVault' })
  }

  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
    onExit: handleExit,
  })

  return (
    <Match
      value={step}
      greeting={() => <OnboardingGreeting onFinish={toNextStep} />}
      steps={() => (
        <OnboardingSteps onFinish={toNextStep} onBack={toPreviousStep} />
      )}
      summary={() => <OnboardingSummary />}
    />
  )
}

import { useHasFinishedOnboarding } from '../../onboarding/hooks/useHasFinishedOnboarding'
import { OnboardingController } from './onboarding/OnboardingController'
import { SetupVaultPage } from './SetupVaultPage'

export const SetupVaultPageController = () => {
  const [hasFinishedOnboarding] = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

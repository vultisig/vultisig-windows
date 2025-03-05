import { useHasFinishedOnboarding } from '../../onboarding/hooks/useHasFinishedOnboarding'
import { NewVaultPage } from '../../vaults/components/NewVaultPage'
import { OnboardingController } from './onboarding/OnboardingController'

export const SetupVaultPageController = () => {
  const [hasFinishedOnboarding] = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <NewVaultPage /> : <OnboardingController />
}

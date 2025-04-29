import { SetupVaultPage } from '@core/ui/vault/create/setup-vault'

import { useHasFinishedOnboarding } from '../../onboarding/hooks/useHasFinishedOnboarding'
import { OnboardingController } from './onboarding/OnboardingController'

export const SetupVaultPageController = () => {
  const [hasFinishedOnboarding] = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

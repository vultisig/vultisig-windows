import { useHasFinishedOnboarding } from '@core/ui/storage/onboarding'
import { SetupVaultPage } from '@core/ui/vault/create/setup-vault'

import { OnboardingController } from './onboarding/OnboardingController'

export const SetupVaultPageController = () => {
  const hasFinishedOnboarding = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

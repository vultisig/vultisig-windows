import { OnboardingController } from '@core/ui/onboarding/OnboardingController'
import { useHasFinishedOnboarding } from '@core/ui/storage/onboarding'
import { SetupVaultPage } from '@core/ui/vault/create/setup-vault'

export const SetupVaultPageController = () => {
  const hasFinishedOnboarding = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

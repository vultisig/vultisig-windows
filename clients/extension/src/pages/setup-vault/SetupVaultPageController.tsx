import { OnboardingController } from '@clients/extension/src/components/onboarding/OnboardingController'
import { useHasFinishedOnboarding } from '@core/ui/storage/onboarding'
import { SetupVaultPage } from '@core/ui/vault/create/setup-vault'

export const SetupVaultPageController = () => {
  const hasFinishedOnboarding = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

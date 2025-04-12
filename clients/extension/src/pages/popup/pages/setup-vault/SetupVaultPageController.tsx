import { useHasFinishedOnboarding } from '@clients/extension/src/components/onboarding/hooks/useHasFinishedOnboarading'
import { OnboardingController } from '@clients/extension/src/components/onboarding/OnboardingController'
import { SetupVaultPage } from '@clients/extension/src/pages/popup/pages/setup-vault'

export const SetupVaultPageController = () => {
  const { data: hasFinishedOnboarding } = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

import { useHasFinishedOnboarding } from '../../../../components/setup-vault/onboarding/hooks/useHasFinishedOnboarading'
import { OnboardingController } from '../../../../components/setup-vault/onboarding/OnboardingController'
import { SetupVaultPage } from '.'

export const SetupVaultPageController = () => {
  const { data: hasFinishedOnboarding } = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

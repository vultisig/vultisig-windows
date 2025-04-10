import { useHasFinishedOnboarding } from '../../../../components/onboarding/hooks/useHasFinishedOnboarading'
import { OnboardingController } from '../../../../components/onboarding/OnboardingController'
import { SetupVaultPage } from '.'

export const SetupVaultPageController = () => {
  const { data: hasFinishedOnboarding } = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

import { SetupVaultPage } from '@core/ui/vault/create/setup-vault'

import { useHasFinishedOnboarding } from '../../../../components/onboarding/hooks/useHasFinishedOnboarading'
import { OnboardingController } from '../../../../components/onboarding/OnboardingController'

export const SetupVaultPageController = () => {
  const { data: hasFinishedOnboarding } = useHasFinishedOnboarding()

  return hasFinishedOnboarding ? <SetupVaultPage /> : <OnboardingController />
}

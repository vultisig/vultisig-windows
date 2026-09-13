import { OnboardingPage } from '@core/ui/onboarding/components/OnboardingPage'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'

/** Onboarding, shown only while it has not been completed. */
export const OnboardingView = () => (
  <IncompleteOnboardingOnly>
    <OnboardingPage />
  </IncompleteOnboardingOnly>
)

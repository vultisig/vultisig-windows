import { OnboardingController } from './onboarding/OnboardingController';
import { useOnboardingCompletion } from './onboarding/state/OnboardingCompletionProvider';
import { SetupVaultPage } from './SetupVaultPage';

export const SetupVaultPageController = () => {
  const [isOnboarded] = useOnboardingCompletion();

  return isOnboarded ? <SetupVaultPage /> : <OnboardingController />;
};

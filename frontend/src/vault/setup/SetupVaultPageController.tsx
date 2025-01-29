import { ARE_FAST_AND_ACTIVE_VAULTS_DISABLED } from './constants';
import { OnboardingController } from './onboarding/OnboardingController';
import { useOnboardingCompletion } from './onboarding/state/OnboardingCompletionProvider';
import { SecureSetupVaultPage } from './SecureSetupVaultPage';
import { SetupVaultPage } from './SetupVaultPage';

export const SetupVaultPageController = () => {
  const [isOnboarded] = useOnboardingCompletion();

  return isOnboarded ? (
    ARE_FAST_AND_ACTIVE_VAULTS_DISABLED ? (
      <SecureSetupVaultPage />
    ) : (
      <SetupVaultPage />
    )
  ) : (
    <OnboardingController />
  );
};

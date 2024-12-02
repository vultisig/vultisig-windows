import { ARE_FAST_AND_ACTIVE_VAULTS_DISABLED } from './constants';
import { SecureSetupVaultPage } from './SecureSetupVaultPage';
import { SetupVaultPage } from './SetupVaultPage';

export const SetupVaultPageController = () =>
  ARE_FAST_AND_ACTIVE_VAULTS_DISABLED ? (
    <SecureSetupVaultPage />
  ) : (
    <SetupVaultPage />
  );

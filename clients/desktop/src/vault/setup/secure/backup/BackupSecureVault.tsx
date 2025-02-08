import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { storage } from '../../../../../wailsjs/go/models';
import { Match } from '../../../../lib/ui/base/Match';
import { StepTransition } from '../../../../lib/ui/base/StepTransition';
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { appPaths } from '../../../../navigation';
import { useVaults } from '../../../queries/useVaultsQuery';
import { SetupVaultSummaryStep } from '../../shared/SetupVaultSummaryStep';
import { BackupConfirmation } from './BackupConfirmation';
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne';
import { BackupSuccessSlide } from './BackupSuccessSlides';
import { NewVaultProvider } from './state/NewVaultProvider';

const steps = [
  'backupSlideshowPartOne',
  'backupConfirmation',
  'backupSuccessfulSlideshow',
] as const;

type BackupFastVaultProps = {
  vault: storage.Vault;
};

export const BackupSecureVault: FC<BackupFastVaultProps> = ({ vault }) => {
  const navigate = useNavigate();
  const { step, toNextStep } = useStepNavigation({
    steps,
  });
  const vaults = useVaults();
  // @antonio: by design we only need to show the summary step if user has exactly 2 vaults
  const shouldShowBackupSummary = vaults.length === 2;

  return (
    <NewVaultProvider initialValue={vault}>
      <Match
        value={step}
        backupSlideshowPartOne={() => (
          <BackupOverviewSlidesPartOne onCompleted={toNextStep} />
        )}
        backupConfirmation={() => (
          <BackupConfirmation onCompleted={toNextStep} vault={vault} />
        )}
        backupSuccessfulSlideshow={() =>
          shouldShowBackupSummary ? (
            <StepTransition
              from={({ onForward }) => (
                <SetupVaultSummaryStep onForward={onForward} vaultType="fast" />
              )}
              to={() => (
                <BackupSuccessSlide
                  onCompleted={() => navigate(appPaths.vault)}
                />
              )}
            />
          ) : (
            <BackupSuccessSlide onCompleted={() => navigate(appPaths.vault)} />
          )
        }
      />
    </NewVaultProvider>
  );
};

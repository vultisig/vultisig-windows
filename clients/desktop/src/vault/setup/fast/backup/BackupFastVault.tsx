import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { storage } from '../../../../../wailsjs/go/models';
import { Match } from '../../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { appPaths } from '../../../../navigation';
import { getStorageVaultId } from '../../../utils/storageVault';
import { EmailConfirmation } from '.';
import { BackupConfirmation } from './BackupConfirmation';
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne';
import { BackupOverviewSlidesPartTwo } from './BackupOverviewSlidesPartTwo';
import { BackupSuccessSlide } from './BackupSuccessSlides';

const steps = [
  'backupSlideshowPartOne',
  'emailVerification',
  'backupSlideshowPartTwo',
  'backupConfirmation',
  'backupSuccessfulSlideshow',
] as const;

type BackupFastVaultProps = {
  vault: storage.Vault;
};

export const BackupFastVault: FC<BackupFastVaultProps> = ({ vault }) => {
  const navigate = useNavigate();
  const vaultId = getStorageVaultId(vault);
  const { step, toNextStep } = useStepNavigation({
    steps,
  });

  return (
    <Match
      value={step}
      backupSlideshowPartOne={() => (
        <BackupOverviewSlidesPartOne onCompleted={toNextStep} />
      )}
      emailVerification={() => (
        <EmailConfirmation onCompleted={toNextStep} vaultId={vaultId} />
      )}
      backupSlideshowPartTwo={() => (
        <BackupOverviewSlidesPartTwo onCompleted={toNextStep} />
      )}
      backupConfirmation={() => (
        <BackupConfirmation onCompleted={toNextStep} vault={vault} />
      )}
      backupSuccessfulSlideshow={() => (
        <BackupSuccessSlide onCompleted={() => navigate(appPaths.vault)} />
      )}
    />
  );
};
